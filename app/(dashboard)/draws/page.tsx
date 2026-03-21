import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Ticket, Trophy, XCircle } from 'lucide-react'

export default async function DrawsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all completed/published draws backwards
  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .in('status', ['published', 'completed'])
    .order('month', { ascending: false })

  // Fetch entries and winnings for current user
  const [ { data: entries }, { data: winners } ] = await Promise.all([
    supabase.from('draw_entries').select('*').eq('user_id', user.id),
    supabase.from('winners').select('*').eq('user_id', user.id)
  ])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Draw History</h1>
        <p className="text-zinc-400">View past monthly jackpot draws and your matched numbers.</p>
      </div>

      <div className="space-y-6 mt-8">
        {(!draws || draws.length === 0) ? (
          <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
            <Ticket className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">No draws yet</h3>
            <p className="text-zinc-500 mt-1 max-w-xs mx-auto">The first monthly jackpot draw will appear here once it's completed and published.</p>
          </div>
        ) : (
          draws.map(draw => {
            const myEntry = entries?.find(e => e.draw_id === draw.id)
            const myWin = winners?.find(w => w.draw_id === draw.id)

            return (
              <div key={draw.id} className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-zinc-800/50 pb-6 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {format(new Date(draw.month), 'MMMM yyyy')} Draw
                    </h2>
                    <p className="text-sm text-emerald-400 font-medium">${draw.jackpot_amount.toFixed(2)} Jackpot</p>
                  </div>
                  
                  {myWin ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-lg flex items-center gap-3">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                      <div>
                        <p className="text-xs font-bold text-yellow-500 uppercase tracking-wider">{myWin.match_type} Winner!</p>
                        <p className="text-sm font-medium text-yellow-400">${myWin.prize_amount.toFixed(2)} Won</p>
                      </div>
                    </div>
                  ) : myEntry ? (
                    <div className="bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-lg flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-zinc-500" />
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">No Prize</p>
                        <p className="text-sm font-medium text-zinc-400">{myEntry.matched} numbers matched</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-500/5 border border-red-500/10 px-4 py-2 rounded-lg flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-500/40" />
                      <div>
                        <p className="text-sm font-medium text-red-400">Did not participate</p>
                        <p className="text-xs text-red-400/70">Inactive subscription during this draw</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Winning Numbers */}
                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Winning Numbers</h3>
                    <div className="flex flex-wrap gap-2">
                      {draw.numbers.map((num: number, idx: number) => (
                        <div key={`win-${idx}`} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-primary/20">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Your Numbers */}
                  {myEntry && (
                    <div>
                      <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Your Assigned Numbers</h3>
                      <div className="flex flex-wrap gap-2">
                        {myEntry.numbers.map((num: number, idx: number) => {
                          const isMatch = draw.numbers.includes(num);
                          return (
                            <div key={`my-${idx}`} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border ${
                              isMatch 
                                ? 'bg-yellow-500 text-yellow-950 border-yellow-400 ring-2 ring-yellow-500/30' 
                                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                            }`}>
                              {num}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
