import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(req: Request) {
  try {
    const { scoreId } = await req.json()
    if (!scoreId) return NextResponse.json({ error: 'Score ID required' }, { status: 400 })

    const supabase = getAdminSupabase()
    const { error } = await supabase.from('scores').delete().eq('id', scoreId)
    
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
        
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId, score, playedAt } = await req.json()
    
    if (!userId || !score || !playedAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getAdminSupabase()
    const { error } = await supabase.from('scores').insert({
      user_id: userId,
      score: Number(score),
      played_at: playedAt
    })
    
    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
