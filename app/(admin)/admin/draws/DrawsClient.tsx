'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, Play, CheckCircle2, Ticket, Calculator, Loader2 } from 'lucide-react'

export default function DrawsClient() {
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [newMonth, setNewMonth] = useState('')
  const [newLogic, setNewLogic] = useState('algorithmic')

  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [simulatingDrawId, setSimulatingDrawId] = useState<string | null>(null)

  const fetchDraws = async () => {
    const res = await fetch('/api/admin/draws')
    const data = await res.json()
    setDraws(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDraws()
  }, [])

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    
    // API logic automatically computes the 5 numbers internally based on the logic flag
    await fetch('/api/admin/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: newMonth, logic: newLogic })
    })

    await fetchDraws()
    setModalOpen(false)
    setProcessing(false)
    setNewMonth('')
  }

  const handleSimulate = async (drawId: string) => {
    setProcessing(true)
    const res = await fetch(`/api/admin/draws/${drawId}/simulate`, { method: 'POST' })
    const data = await res.json()
    
    if (res.ok) {
      setSimulationResult(data)
      setSimulatingDrawId(drawId)
    } else {
      alert('Simulation Failed: ' + data.error)
    }
    setProcessing(false)
  }

  const handlePublish = async () => {
    if (!simulatingDrawId || !simulationResult || !confirm('Publishing is PERMANENT. This will instantly allocate prizes and reveal numbers to users. Continue?')) return
    setProcessing(true)

    const res = await fetch(`/api/admin/draws/${simulatingDrawId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Pass the fully verified simulation state downstream to commit seamlessly
      body: JSON.stringify({
        simulation: simulationResult.simulation,
        rolloverApplied: simulationResult.rollover_applied
      })
    })

    if (res.ok) {
      setSimulationResult(null)
      setSimulatingDrawId(null)
      fetchDraws()
    } else {
      const errState = await res.json()
      alert('Failed to publish: ' + errState.error)
    }
    setProcessing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-zinc-900 border border-zinc-800 p-4 rounded-xl items-center justify-between">
        <p className="text-zinc-400 text-sm font-medium">Warning: Published draws are immutable and broadcast instantly to the platform.</p>
        <button onClick={() => setModalOpen(true)} className="h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg flex items-center shadow-sm whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" /> New Target Draw
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Draw Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white mb-4">Draw Execution Ledger</h2>
          {loading ? (
            <div className="flex h-32 items-center justify-center border border-zinc-800 bg-zinc-900 rounded-xl"><Loader2 className="w-6 h-6 animate-spin text-zinc-500"/></div>
          ) : draws.length === 0 ? (
             <div className="flex flex-col h-32 items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 pb-2">
               No draws created yet.
             </div>
          ) : (
            draws.map(draw => (
              <div key={draw.id} className={`border p-5 rounded-xl flex items-center justify-between transition-all ${draw.status === 'published' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-white text-lg">{format(new Date(draw.month), 'MMMM yyyy')}</h3>
                    {draw.status === 'published' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Published</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-400 uppercase font-bold tracking-wider">Pending Execution</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-zinc-400 flex items-center font-medium uppercase tracking-wider"><Calculator className="w-3.5 h-3.5 mr-1" /> {draw.logic} Logic</p>
                    <p className="text-xs text-emerald-300 font-bold">Jackpot pool: €{draw.jackpot_amount?.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <div className="flex -space-x-2 mr-4">
                    {draw.numbers.map((n: number, i: number) => (
                       <span key={i} className={`w-8 h-8 rounded-full border-2 border-zinc-900 flex items-center justify-center text-xs font-bold shadow-md ${draw.status === 'published' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>{n}</span>
                    ))}
                  </div>

                  {draw.status === 'upcoming' && (
                    <button 
                      onClick={() => handleSimulate(draw.id)} 
                      disabled={processing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm flex items-center disabled:opacity-50 shadow-sm"
                    >
                      <Play className="w-4 h-4 mr-2" /> Simulate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Simulation Sandbox UI */}
        <div className="lg:col-span-1">
           <div className="border border-zinc-800 bg-zinc-950/80 rounded-xl p-5 sticky top-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-wider text-sm text-zinc-500 flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Live Simulation
              </h2>

              {!simulationResult ? (
                <div className="py-12 text-center text-zinc-500 text-sm border-2 border-dashed border-zinc-800 rounded-lg">
                  Select "Simulate" on a pending draw<br/>to preview exact user trajectories.
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 fade-in">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Total Valid Subscriptions (Eligible)</p>
                    <p className="text-3xl font-black text-white">{simulationResult.simulation.summary.totalEntries}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Jackpot Pool</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">€{simulationResult.simulation.pools.jackpot}</p>
                      {simulationResult.rollover_applied && <p className="text-[9px] text-pink-400 font-bold mt-1 tracking-widest">+€{simulationResult.rolloverAmount} ROLLOVER</p>}
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Match 4 Pool</p>
                      <p className="text-xl font-bold text-white mt-1">€{simulationResult.simulation.pools.pool4match}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Match 3 Pool</p>
                      <p className="text-xl font-bold text-white mt-1">€{simulationResult.simulation.pools.pool3match}</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-zinc-800 pb-2">Identified Winners</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400 font-medium">Jackpot (5 Matches)</span>
                      <span className="font-bold text-white">{simulationResult.simulation.summary.jackpotWinnersCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400 font-medium">Match 4 Tier</span>
                      <span className="font-bold text-white">{simulationResult.simulation.summary.match4WinnersCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400 font-medium">Match 3 Tier</span>
                      <span className="font-bold text-white">{simulationResult.simulation.summary.match3WinnersCount}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePublish}
                    disabled={processing}
                    className="w-full h-12 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm flex items-center justify-center uppercase tracking-widest text-sm transition-all"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Publish Draw'}
                  </button>
                  <button onClick={() => {setSimulationResult(null); setSimulatingDrawId(null);}} className="w-full text-zinc-500 hover:text-white text-xs font-medium uppercase tracking-wider pt-2">Dismiss Simulation</button>
                </div>
              )}
           </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateDraw} className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
               <h3 className="text-lg font-bold text-white flex items-center"><Ticket className="w-5 h-5 text-pink-500 mr-2" /> Allocate Target Draw</h3>
               <p className="text-xs text-zinc-400 mt-1">Generates the sealed numbers. Computation runs dynamically during simulation.</p>
             </div>
             
             <div className="p-6 space-y-5">
               <div className="space-y-2">
                 <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Designated Draw Month</label>
                 <input type="month" required value={newMonth} onChange={e => setNewMonth(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500" />
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Extraction Logic Engine</label>
                 <select required value={newLogic} onChange={e => setNewLogic(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500">
                   <option value="algorithmic">Algorithmic Distribution (Weights frequent user scores)</option>
                   <option value="random">Pure Random (Mathematically uniform distribution 1-45)</option>
                 </select>
               </div>
             </div>

             <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
               <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
               <button type="submit" disabled={processing} className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center shadow-sm disabled:opacity-50">
                 {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Initialize Draw
               </button>
             </div>
          </form>
        </div>
      )}
    </div>
  )
}
