import WinnersClient from './WinnersClient'
import { createClient } from '@supabase/supabase-js'

const getAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminWinnersPage() {
  const supabase = getAdminSupabase()
  
  const { data: winners, error } = await supabase
    .from('winners')
    .select('*, profiles(full_name, email), draws(month)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin winners list bypassing RLS:', error)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Winners & Payouts</h1>
        <p className="text-zinc-400">Verify user scorecards and track financial prize distributions across all draws.</p>
      </div>

      <WinnersClient initialWinners={winners || []} />
    </div>
  )
}
