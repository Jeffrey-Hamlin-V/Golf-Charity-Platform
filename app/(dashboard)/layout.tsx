import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import SubscriptionGate from '@/components/shared/SubscriptionGate'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      <Sidebar userFullName={profile?.full_name} userEmail={profile?.email || user.email || ''} />
      <main className="flex-1 flex flex-col w-full pb-16 md:pb-0 md:h-screen md:overflow-y-auto">
        <SubscriptionGate>
          <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 text-zinc-50">
            {children}
          </div>
        </SubscriptionGate>
      </main>
    </div>
  )
}
