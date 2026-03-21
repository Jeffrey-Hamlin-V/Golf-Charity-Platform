'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Score } from '@/types'
import { format } from 'date-fns'

export default function ScoreList({ userId }: { userId: string }) {
  const [scores, setScores] = useState<Score[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchScores = async () => {
      const { data } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
      
      if (data) setScores(data)
    }

    fetchScores()
  }, [userId])

  return (
    <div className="p-6 bg-card rounded-lg shadow-sm border space-y-4">
      <h2 className="text-xl font-semibold">Recent Scores</h2>
      {scores.length === 0 ? (
        <p className="text-sm text-muted-foreground">No scores recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {scores.map((score) => (
            <div key={score.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-lg">{score.score}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(score.played_at), 'MMM d, yyyy')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
