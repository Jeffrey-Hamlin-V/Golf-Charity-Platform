'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WinningsOverview({ userId }: { userId: string }) {
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchWinnings = async () => {
      const { data } = await supabase
        .from('winners')
        .select('prize_amount')
        .eq('user_id', userId)
        .eq('verification_status', 'verified')
      
      if (data) {
        const total = data.reduce((acc, curr) => acc + curr.prize_amount, 0)
        setTotalWinnings(total)
      }
      setLoading(false)
    }

    fetchWinnings()
  }, [userId])

  if (loading) return <div className="p-6 bg-card border rounded-lg h-32 animate-pulse" />

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border flex flex-col items-center justify-center text-center space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Lifetime Winnings</h2>
      <p className="text-4xl font-bold tracking-tight text-primary">
        ${totalWinnings.toFixed(2)}
      </p>
    </div>
  )
}
