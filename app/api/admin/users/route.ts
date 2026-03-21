import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper for pure admin operations bypassing RLS
const getAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const supabase = getAdminSupabase()
    
    // Fetch profiles along with their raw scores to satisfy the requirement: "see full profile, golf scores, charity"
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        *,
        scores ( id, score, played_at )
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json(users)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = getAdminSupabase()
    const { id, updates } = await req.json()

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing required payload' }, { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
