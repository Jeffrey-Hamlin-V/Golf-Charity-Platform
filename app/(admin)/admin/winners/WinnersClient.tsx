'use client'

import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function WinnersClient() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [filterVerification, setFilterVerification] = useState('all')
  const [filterPayout, setFilterPayout] = useState('all')

  const fetchWinners = async () => {
    const res = await fetch('/api/admin/winners')
    const data = await res.json()
    setWinners(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchWinners()
  }, [])

  const handleUpdateStatus = async (winnerId: string, field: 'verification_status' | 'payout_status', value: string) => {
    // Optimistic update
    setWinners(prev => prev.map(w => w.id === winnerId ? { ...w, [field]: value } : w))

    await fetch(`/api/admin/winners/${winnerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    })
  }

  const filteredWinners = winners.filter(w => {
    if (filterVerification !== 'all' && w.verification_status !== filterVerification) return false
    if (filterPayout !== 'all' && w.payout_status !== filterPayout) return false
    return true
  })

  // Helper for status badge rendering
  const StatusBadge = ({ type, value }: { type: 'proof' | 'payout', value: string }) => {
    if (value === 'pending') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 w-fit"><Clock className="w-3" /> Pending</span>
    if (value === 'verified' || value === 'paid') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit"><CheckCircle2 className="w-3" /> {value}</span>
    return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 w-fit"><XCircle className="w-3" /> {value}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl items-center">
        <div className="flex items-center gap-2 text-zinc-400 font-medium test-sm mr-4">
          <Filter className="w-4 h-4" /> Filters:
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verification</label>
          <select value={filterVerification} onChange={e => setFilterVerification(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Payout</label>
          <select value={filterPayout} onChange={e => setFilterPayout(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950/50 text-xs uppercase text-zinc-500 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Draw Month</th>
                  <th className="px-6 py-4 font-medium">Winner Details</th>
                  <th className="px-6 py-4 font-medium">Prize Won</th>
                  <th className="px-6 py-4 font-medium">Scorecard Proof</th>
                  <th className="px-6 py-4 font-medium">Financial Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredWinners.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {w.draws?.month ? format(new Date(w.draws.month), 'MMMM yyyy') : 'Unknown Date'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{w.profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{w.profiles?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-emerald-400">€{parseFloat(w.prize_amount).toFixed(2)}</p>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{w.match_type} Match</span>
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <StatusBadge type="proof" value={w.verification_status} />
                      <div className="flex items-center gap-2">
                        {w.proof_url && (
                          <a href={w.proof_url} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 flex items-center font-medium">
                            <ExternalLink className="w-3 h-3 mr-1" /> View Image
                          </a>
                        )}
                        <select 
                          value={w.verification_status} 
                          onChange={(e) => handleUpdateStatus(w.id, 'verification_status', e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-white text-xs px-2 py-1 rounded w-full"
                        >
                          <option value="pending">Mark Pending</option>
                          <option value="verified">Approve Proof</option>
                          <option value="rejected">Reject Proof</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <StatusBadge type="payout" value={w.payout_status} />
                      <div className="flex items-center gap-2 w-full">
                        <select 
                          value={w.payout_status} 
                          onChange={(e) => handleUpdateStatus(w.id, 'payout_status', e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-white text-xs px-2 py-1 rounded w-full"
                        >
                          <option value="pending">Awaiting Payout</option>
                          <option value="paid">Record Paid</option>
                          <option value="failed">Mark Failed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredWinners.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No winners found matching these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
