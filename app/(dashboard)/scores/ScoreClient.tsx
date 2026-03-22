'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Target, Trash2, Calendar, Plus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

type Score = {
  id: string
  score: number
  played_at: string
}

export default function ScoreClient({ initialScores, userId }: { initialScores: Score[], userId: string }) {
  const [scores, setScores] = useState<Score[]>(initialScores)
  const [score, setScore] = useState<string>('')
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!date) {
      setError('Date played is required')
      setLoading(false)
      return
    }

    const numScore = parseInt(score)
    if (isNaN(numScore) || numScore < 1 || numScore > 45) {
      setError('Score must be between 1 and 45')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('scores')
      .insert({
        user_id: userId,
        score: numScore,
        played_at: date
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
    } else if (data) {
      // Optimistic update
      const newScores = [data, ...scores].sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime()).slice(0, 5)
      setScores(newScores)
      setScore('')
      router.refresh()
    }
    setLoading(false)
  }

  const handleDeleteScore = async (id: string) => {
    const { error } = await supabase.from('scores').delete().eq('id', id)
    if (!error) {
      setScores(scores.filter(s => s.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Entry Form */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm h-fit">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-6 text-white">
          <Plus className="w-5 h-5 text-primary" /> Log New Score
        </h2>
        
        <form onSubmit={handleAddScore} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Target Score (1-45)</label>
            <input
              type="number"
              min="1"
              max="45"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
              placeholder="e.g. 36"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Date Played</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Cannot be in future
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow [color-scheme:dark]"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-10 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Score'}
          </button>
        </form>
      </div>

      {/* Scores Display */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-blue-500" /> Scoring History
          </h2>
          <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full shadow-inner">
            {scores.length}/5 Logged
          </span>
        </div>

        <div className="space-y-3">
          {scores.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
              <Target className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">No scores logged yet.</p>
              <p className="text-xs text-zinc-500 mt-1">Add a score to get started.</p>
            </div>
          ) : (
            scores.map((s) => (
              <div key={s.id} className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xl text-white shadow-sm">
                    {s.score}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Stableford Points</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {format(new Date(s.played_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteScore(s.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete score"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
