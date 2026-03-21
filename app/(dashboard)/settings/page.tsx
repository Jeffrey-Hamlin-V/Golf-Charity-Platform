import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Account Settings</h1>
        <p className="text-zinc-400">Manage your profile details and platform subscription.</p>
      </div>

      <div className="mt-8">
        <SettingsClient profile={profile} email={user.email || ''} />
      </div>
    </div>
  )
}
