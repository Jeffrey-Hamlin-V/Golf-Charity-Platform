import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight, Trophy, Target, Heart, Calendar, Ticket } from 'lucide-react'
import CheckoutButton from '@/components/shared/CheckoutButton'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch parallelized dashboard data
  const [
    { data: profile },
    { data: scores },
    { data: entries },
    { data: winnings },
    { data: nextDraw }
  ] = await Promise.all([
    supabase.from('profiles').select('*, charity:charities(*)').eq('id', user.id).single(),
    supabase.from('scores').select('*').eq('user_id', user.id).order('played_at', { ascending: false }).limit(5),
    supabase.from('draw_entries').select('id', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('winners').select('*').eq('user_id', user.id),
    supabase.from('draws').select('month').eq('status', 'upcoming').order('month', { ascending: true }).limit(1).single() // Assuming 'upcoming' exists or it returns null, which is fine
  ])

  const totalWon = winnings?.reduce((sum, w) => sum + w.prize_amount, 0) || 0
  const pendingPrizes = winnings?.filter(w => w.payout_status === 'pending').length || 0
  const prof = profile as any // Loose cast for nested charity relation unrepresented in top-level types

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back, {prof?.full_name || 'Golfer'}!</h1>
        <p className="text-zinc-400">Here's your charity golf platform overview.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Subscription Status Card */}
        <div className="col-span-1 border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-primary" /> Subscription
            </h2>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              prof?.subscription_status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {prof?.subscription_status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {prof?.subscription_status === 'active' ? (
            <div className="space-y-1">
              <p className="text-zinc-300"><span className="text-zinc-500">Plan:</span> <span className="capitalize">{prof.subscription_plan}</span></p>
              <p className="text-zinc-300"><span className="text-zinc-500">Renews:</span> {prof.subscription_renewal_date ? format(new Date(prof.subscription_renewal_date), 'MMM d, yyyy') : 'N/A'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Your subscription is currently inactive.</p>
              <CheckoutButton priceId={process.env.STRIPE_MONTHLY_PRICE_ID || ''} userId={user.id} className="w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition" />
            </div>
          )}
        </div>

        {/* Winnings Overview Card */}
        <div className="col-span-1 border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy className="w-32 h-32 text-yellow-500" />
          </div>
          <h2 className="font-semibold text-lg flex items-center gap-2 mb-4 text-white hover:text-yellow-500 transition-colors">
            <Trophy className="w-5 h-5 text-yellow-500" /> Winnings
          </h2>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-white">${totalWon.toFixed(2)}</p>
            <p className="text-sm text-zinc-400">Total lifetime winnings</p>
            {pendingPrizes > 0 && (
               <p className="text-xs font-semibold text-yellow-900 bg-yellow-500 px-2 py-1 rounded inline-block mt-2">
                 {pendingPrizes} prize(s) pending payout
               </p>
            )}
          </div>
        </div>

        {/* Participation Summary Card */}
        <div className="col-span-1 border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg flex items-center gap-2 mb-4 text-white">
            <Ticket className="w-5 h-5 text-purple-500" /> Participation
          </h2>
          <div className="space-y-4 text-zinc-300">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Draws Entered</span>
              <span className="font-bold text-lg">{entries?.count || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Next Draw</span>
              <span className="font-medium text-white">{nextDraw?.month ? format(new Date(nextDraw.month), 'MMM yyyy') : 'End of Month'}</span>
            </div>
            <Link href="/draws" className="text-sm text-primary hover:text-primary/80 inline-flex items-center mt-2 group">
              View history <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Charity Overview Card */}
        <div className="col-span-1 md:col-span-2 border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500/20" /> My Supported Charity
              </h2>
              <Link href="/charity" className="text-sm border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded-md transition-colors">
                Change Charity
              </Link>
            </div>
            {prof?.charity ? (
              <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-1.5">{prof.charity.name}</h3>
                <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{prof.charity.description}</p>
                <div className="inline-flex items-center gap-2 bg-pink-500/10 text-pink-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {prof.charity_contribution_pct}% Contribution Rate
                </div>
              </div>
            ) : (
              <p className="text-zinc-400">No charity selected yet.</p>
            )}
          </div>
        </div>

        {/* Scores Overview Card */}
        <div className="col-span-1 md:col-span-1 border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-blue-500" /> Recent Scores
            </h2>
            <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full shadow-inner">{scores?.length || 0}/5 Logged</span>
          </div>
          
          <div className="space-y-2 mb-6">
            {(!scores || scores.length === 0) ? (
              <p className="text-sm text-zinc-500 py-4 text-center">No scores recorded.</p>
            ) : (
              scores.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/50">
                  <span className="font-bold text-white w-8 text-center">{s.score}</span>
                  <span className="text-xs text-zinc-500 font-medium">{format(new Date(s.played_at), 'MMM d, yyyy')}</span>
                </div>
              ))
            )}
          </div>
          <Link href="/scores" className="block text-center text-sm w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium">
            Manage Scores
          </Link>
        </div>

      </div>
    </div>
  )
}
