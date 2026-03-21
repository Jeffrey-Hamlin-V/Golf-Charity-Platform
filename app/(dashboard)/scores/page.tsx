import { createClient } from '@/lib/supabase/server'
import ScoreClient from './ScoreClient'

export default async function ScoresPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch current scores
  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('played_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Scores</h1>
        <p className="text-zinc-400">Log your recent golf scores. Only your 5 most recent scores are kept.</p>
      </div>

      <ScoreClient initialScores={scores || []} userId={user.id} />
    </div>
  )
}
