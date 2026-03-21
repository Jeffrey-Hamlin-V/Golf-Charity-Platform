import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsersClient from './UsersClient'

export default async function AdminUsersPage() {
  // Use standard server client to assert identity first
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch charities for the charity dropdowns inside the edit modal
  const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: charities } = await adminSupabase.from('charities').select('*')

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-zinc-400">View and manage all registered platform users, subscriptions, and scores.</p>
      </div>

      <UsersClient charities={charities || []} />
    </div>
  )
}
