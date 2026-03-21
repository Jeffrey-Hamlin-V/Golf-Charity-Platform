'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Draw } from '@/types'
import { format } from 'date-fns'

export default function DrawHistory() {
  const [draws, setDraws] = useState<Draw[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchDraws = async () => {
      const { data } = await supabase
        .from('draws')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setDraws(data)
    }

    fetchDraws()
  }, [])

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border space-y-4">
      <h2 className="text-xl font-semibold">Recent Draws</h2>
      {draws.length === 0 ? (
        <p className="text-sm text-muted-foreground">No draws have been completed yet.</p>
      ) : (
        <div className="space-y-4">
          {draws.map((draw) => (
            <div key={draw.id} className="p-4 border rounded-md space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{format(new Date(draw.month), 'MMMM yyyy')} Draw</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${draw.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {draw.status.charAt(0).toUpperCase() + draw.status.slice(1)}
                </span>
              </div>
              <p className="text-sm">Jackpot: <span className="font-medium">${draw.jackpot_amount}</span></p>
              {draw.status === 'completed' && draw.numbers && (
                <div className="flex gap-2 mt-2">
                  {draw.numbers.map((n, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
