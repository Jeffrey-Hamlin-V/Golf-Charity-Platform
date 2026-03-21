import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { priceId, userId } = await req.json()

    if (userId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single()

    let stripeCustomerId = profile?.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabaseUUID: user.id
        }
      })
      stripeCustomerId = customer.id

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      client_reference_id: user.id,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('STRIPE_CHECKOUT_ERROR:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
