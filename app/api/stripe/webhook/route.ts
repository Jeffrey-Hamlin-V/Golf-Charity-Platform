import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  // Use the standalone supabase-js client with the service role key to forcefully bypass RLS constraints
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
      
      // Determine plan by extracting the Price ID. This gracefully handles string/object typing edge cases
      const priceRaw = subscription.items.data[0].price
      const priceId = typeof priceRaw === 'string' ? priceRaw : priceRaw.id
      const plan = priceId === process.env.STRIPE_YEARLY_PRICE_ID ? 'yearly' : 'monthly'
      
      // Convert Unix epoch to ISO timestamp securely handling newer Clover API structures
      const periodEnd = (subscription as any).current_period_end || subscription.items.data[0]?.current_period_end || Date.now() / 1000
      const renewalDate = new Date(periodEnd * 1000).toISOString()
      const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'past_due'

      // Lookup the Customer to verify the originally injected Supabase UUID metadata
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
      const supabaseUUID = customer.metadata?.supabaseUUID

      if (supabaseUUID) {
        // Guarantee synchronization by binding directly to the source-of-truth UUID
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            subscription_id: subscription.id,
            subscription_plan: plan,
            subscription_renewal_date: renewalDate,
            stripe_customer_id: customerId, // Ensure it's synchronized back
          })
          .eq('id', supabaseUUID)

        if (error) throw new Error(error.message)
      } else {
        // Fallback: Bind using strip_customer_id column directly if metadata somehow dropped
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            subscription_id: subscription.id,
            subscription_plan: plan,
            subscription_renewal_date: renewalDate,
          })
          .eq('stripe_customer_id', customerId)

        if (error) throw new Error(error.message)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          subscription_plan: 'none',
          subscription_renewal_date: null,
        })
        .eq('stripe_customer_id', customerId)
        
      if (error) throw new Error(error.message)
    }

    return new NextResponse('Webhook processed successfully', { status: 200 })
  } catch (error: any) {
    console.error('Webhook execution failed:', error.message)
    return new NextResponse('Internal Webhook Error', { status: 500 })
  }
}
