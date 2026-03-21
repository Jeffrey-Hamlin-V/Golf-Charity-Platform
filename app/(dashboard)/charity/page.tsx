import { createClient } from '@/lib/supabase/server'
import CharityClient from './CharityClient'

export default async function CharityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch parallelized data
  const [
    { data: profile },
    { data: charities }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('charities').select('*').eq('is_active', true).order('name', { ascending: true })
  ])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Charity</h1>
        <p className="text-zinc-400">Manage which charity you support and your contribution tier.</p>
      </div>

      <CharityClient 
        userId={user.id}
        initialCharityId={profile?.charity_id || ''}
        initialContributionPct={profile?.charity_contribution_pct || 10}
        charities={charities || []}
      />
    </div>
  )
}
