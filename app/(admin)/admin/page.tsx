import { createClient } from '@/lib/supabase/server'
import { Users, CreditCard, Gift, Trophy } from 'lucide-react'
import { format } from 'date-fns'

export default async function AdminOverviewPage() {
  const supabase = createClient()
  
  // Notice we must use server client fetching standard tables where Service Key isn't needed if policies allow reading profiles to admins
  // Wait, if RLS strips data, we need Service Role here too.
  // Instead of risking RLS blocking admin reading all profiles, we will use the Service Role explicitly in the page
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    { auth: { persistSession: false } }
  )

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: winners },
    { data: recentSignups }
  ] = await Promise.all([
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    adminSupabase.from('winners').select('prize_amount'),
    adminSupabase.from('profiles').select('id, full_name, email, created_at, subscription_status').order('created_at', { ascending: false }).limit(5)
  ])

  // Total absolute prize pool minted out
  const totalPrizes = winners?.reduce((acc, curr) => acc + (curr.prize_amount || 0), 0) || 0

  // Estimated total charities metric based on active users contribution average (or exact sum if tracked, currently proxy)
  // Let's proxy: activeSubscribers * (9.99 * 0.20 avg contribution) roughly
  const estimatedCharityContributions = (activeSubscribers || 0) * 1.99

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-zinc-400">High-level statistics and recent system activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">Total Registered Users</h3>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{totalUsers}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">Active Subscribers</h3>
            <CreditCard className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-white">{activeSubscribers}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">Total Prizes Awarded</h3>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-white">€{totalPrizes.toFixed(2)}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-zinc-400 font-medium text-sm">Est Charity Impact</h3>
            <Gift className="w-5 h-5 text-pink-500" />
          </div>
          <p className="text-3xl font-bold text-white">~€{estimatedCharityContributions.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">Recent Signups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {recentSignups?.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{user.full_name || 'Anonymous User'}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.subscription_status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {user.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Draw Status Summary</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="w-12 h-12 text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-white">Ready for next draw</h3>
            <p className="text-sm text-zinc-400 mt-2 max-w-xs block mx-auto">
              Navigate to the Draws management tab to configure and simulate the next monthly jackpot execution based on {activeSubscribers || 0} active subscriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
