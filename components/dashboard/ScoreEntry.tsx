'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ScoreEntry({ userId }: { userId: string }) {
  const [score, setScore] = useState<number | ''>('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!score || !date) return
    setLoading(true)

    const { error } = await supabase.from('scores').insert([
      { user_id: userId, score: Number(score), played_at: new Date(date).toISOString() }
    ])

    setLoading(false)
    if (!error) {
      setScore('')
      setDate('')
      router.refresh()
    }
  }

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border space-y-4">
      <h2 className="text-xl font-semibold">Enter New Score</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Score</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
            min="18"
            max="150"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Played</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="inline-flex w-full justify-center items-center h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Score'}
        </button>
      </form>
    </div>
  )
}
