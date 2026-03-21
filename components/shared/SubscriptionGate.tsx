import { createClient } from '@/lib/supabase/server'
import CheckoutButton from './CheckoutButton'

export default async function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  const { data: profile } = await supabase.from('profiles').select('subscription_status').eq('id', user.id).single()

  if (profile?.subscription_status === 'active') {
    return <>{children}</>
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-2xl space-y-8 relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white tracking-tight">Subscription Required</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            You need an active subscription to access the dashboard and participate in our monthly charity draws.
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="relative p-5 border border-zinc-700 bg-zinc-950/50 rounded-xl text-left hover:border-zinc-500 transition-all cursor-pointer group">
            <h3 className="font-semibold text-white">Monthly Plan</h3>
            <p className="text-2xl font-bold text-white mt-2">$9.99 <span className="text-sm font-normal text-zinc-500">/mo</span></p>
            <p className="text-sm text-zinc-400 mt-2">Billed monthly. Cancel anytime.</p>
            
            <CheckoutButton 
              priceId={process.env.STRIPE_MONTHLY_PRICE_ID || ''} 
              userId={user.id}
              className="mt-4 w-full h-10 bg-zinc-800 text-white font-medium rounded-md hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 flex items-center justify-center"
            />
          </div>

          <div className="relative p-5 border border-purple-500/50 bg-purple-500/5 rounded-xl text-left hover:border-purple-500 transition-all cursor-pointer group">
            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">2 Months Free</span>
            </div>
            <h3 className="font-semibold text-white">Yearly Plan</h3>
            <p className="text-2xl font-bold text-white mt-2">$99.99 <span className="text-sm font-normal text-zinc-500">/yr</span></p>
            <p className="text-sm text-zinc-400 mt-2">Billed annually. Best value.</p>

            <CheckoutButton 
              priceId={process.env.STRIPE_YEARLY_PRICE_ID || ''} 
              userId={user.id}
              className="mt-4 w-full h-10 bg-white text-zinc-950 font-medium rounded-md hover:bg-zinc-200 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 flex items-center justify-center"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
