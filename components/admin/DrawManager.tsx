'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DrawManager() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleRunDraw = async () => {
    setLoading(true)
    // In a real app, this would call a secure backend endpoint to execute the draw logic
    // rather than doing it directly on the client.
    try {
      const res = await fetch('/api/admin/draws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: new Date().toISOString(),
          numbers: [Math.floor(Math.random() * 50) + 1, Math.floor(Math.random() * 50) + 1, Math.floor(Math.random() * 50) + 1, Math.floor(Math.random() * 50) + 1],
          logic: 'v1',
          status: 'completed',
          jackpot_amount: 5000,
          pool_4match: 1000,
          pool_3match: 500,
          jackpot_rollover: false,
        }),
      })
      if (res.ok) {
        alert('Draw completed successfully!')
      } else {
        alert('Failed to run draw')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-lg border p-6 space-y-4">
      <h2 className="text-xl font-semibold">Run Monthly Draw</h2>
      <p className="text-sm text-muted-foreground">Execute the draw engine for the current month. This action is irreversible.</p>
      <button 
        onClick={handleRunDraw}
        disabled={loading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        {loading ? 'Running Draw...' : 'Execute Draw'}
      </button>
    </div>
  )
}
