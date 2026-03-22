'use client'

import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function WinnersClient({ initialWinners = [] }: { initialWinners?: any[] }) {
  const [winners, setWinners] = useState<any[]>(initialWinners)
  const supabase = createClient()
  
  const [actionModal, setActionModal] = useState<{ open: boolean, winnerId: string | null, field: string | null, value: string | null }>({ open: false, winnerId: null, field: null, value: null })
  const [adminPassword, setAdminPassword] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const [filterVerification, setFilterVerification] = useState('all')
  const [filterPayout, setFilterPayout] = useState('all')

  const handleUpdateStatus = async (winnerId: string, field: 'verification_status' | 'payout_status', value: string) => {
    // Optimistic update
    setWinners(prev => prev.map(w => w.id === winnerId ? { ...w, [field]: value } : w))

    await fetch(`/api/admin/winners/${winnerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    })
  }

  const confirmAction = async () => {
    setVerifying(true)
    setAuthError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      setAuthError("No admin user detected")
      setVerifying(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: adminPassword
    })

    if (error) {
      setAuthError('Incorrect password')
      setVerifying(false)
      return
    }

    if (actionModal.winnerId && actionModal.field && actionModal.value) {
      await handleUpdateStatus(actionModal.winnerId, actionModal.field as any, actionModal.value)
    }

    setActionModal({ open: false, winnerId: null, field: null, value: null })
    setAdminPassword('')
    setVerifying(false)
  }

  const filteredWinners = winners.filter(w => {
    if (filterVerification !== 'all' && w.verification_status !== filterVerification) return false
    if (filterPayout !== 'all' && w.payout_status !== filterPayout) return false
    return true
  })

  // Helper for status badge rendering
  const StatusBadge = ({ type, value }: { type: 'proof' | 'payout', value: string }) => {
    if (value === 'pending') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 w-fit"><Clock className="w-3" /> Pending</span>
    if (value === 'verified' || value === 'approved' || value === 'paid') return <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit"><CheckCircle2 className="w-3" /> {value}</span>
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
            <option value="approved">Approved</option>
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
                      <div className="flex flex-col gap-2 mt-2">
                        {w.proof_url ? (
                          <a href={w.proof_url} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 flex items-center font-medium w-fit bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
                            <ExternalLink className="w-3 h-3 mr-1" /> View Proof Image
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-600 font-medium italic">No image uploaded</span>
                        )}
                        <div className="flex gap-1.5 mt-1">
                          <button 
                            onClick={() => setActionModal({ open: true, winnerId: w.id, field: 'verification_status', value: 'approved' })}
                            className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded border border-emerald-500/20 transition-colors uppercase tracking-wider disabled:opacity-50"
                            disabled={w.verification_status === 'approved'}
                          >Approve</button>
                          <button 
                            onClick={() => setActionModal({ open: true, winnerId: w.id, field: 'verification_status', value: 'rejected' })}
                            className="text-[10px] font-bold px-2 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors uppercase tracking-wider disabled:opacity-50"
                            disabled={w.verification_status === 'rejected'}
                          >Reject</button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-2">
                      <StatusBadge type="payout" value={w.payout_status} />
                      <div className="flex items-center gap-2 w-full mt-2">
                          <button 
                            onClick={() => setActionModal({ open: true, winnerId: w.id, field: 'payout_status', value: 'paid' })}
                            className="text-[10px] font-bold px-2 py-1 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded border border-yellow-500/20 transition-colors uppercase tracking-wider w-full disabled:opacity-50 shadow-sm"
                            disabled={w.payout_status === 'paid'}
                          >Mark as Paid</button>
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
      </div>

      <Dialog open={actionModal.open} onOpenChange={(open) => !open && setActionModal({ open: false, winnerId: null, field: null, value: null })}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Enter your admin password to confirm this action
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <input 
              type="password" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Admin Password"
              className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500 transition-colors"
            />
            {authError && <p className="text-xs text-red-400 mt-2 font-medium">{authError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <button 
              onClick={() => setActionModal({ open: false, winnerId: null, field: null, value: null })}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button 
              onClick={confirmAction}
              disabled={verifying || !adminPassword}
              className="px-4 py-2 text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors rounded-md disabled:opacity-50 flex items-center"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
