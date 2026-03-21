'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Winner } from '@/types'
import { format } from 'date-fns'

export default function WinnersManager() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchWinners = async () => {
      const { data } = await supabase.from('winners').select('*').order('created_at', { ascending: false })
      if (data) setWinners(data)
      setLoading(false)
    }
    fetchWinners()
  }, [])

  if (loading) return <div>Loading winners...</div>

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase">
            <tr>
              <th className="px-6 py-3">User ID</th>
              <th className="px-6 py-3">Match Type</th>
              <th className="px-6 py-3">Prize</th>
              <th className="px-6 py-3">Verification</th>
              <th className="px-6 py-3">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {winners.map((winner) => (
              <tr key={winner.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 text-xs font-mono">{winner.user_id}</td>
                <td className="px-6 py-4 capitalize">{winner.match_type}</td>
                <td className="px-6 py-4 font-medium">${winner.prize_amount}</td>
                <td className="px-6 py-4 capitalize">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    winner.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 
                    winner.verification_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {winner.verification_status}
                  </span>
                </td>
                <td className="px-6 py-4 capitalize">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    winner.payout_status === 'paid' ? 'bg-green-100 text-green-800' : 
                    winner.payout_status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {winner.payout_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
