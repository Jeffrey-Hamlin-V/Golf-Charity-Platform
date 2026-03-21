import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import HomeClient from './HomeClient'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = createClient()
  
  // Fetch active supported charities (limit to 4 for the impact grid)
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .limit(4)

  // Fetch the latest published draw to show live historical proof
  const { data: latestDraw } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('month', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-purple-500/30">
      <Navbar />
      <main className="flex-1 w-full overflow-hidden">
        <HomeClient charities={charities || []} latestDraw={latestDraw || null} />
      </main>
      <Footer />
    </div>
  )
}
