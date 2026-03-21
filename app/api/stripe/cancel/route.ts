import { NextResponse } from 'next/server'
import { Stripe } from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Initialize Stripe matching previous implementations
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
})

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_id')
      .eq('id', user.id)
      .single()

    if (!profile?.subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    // Cancel the subscription at period end (preventing immediate loss of paid service)
    await stripe.subscriptions.update(profile.subscription_id, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({ message: 'Subscription effectively cancelled at period end' })
  } catch (error: any) {
    console.error('Stripe cancel API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
