import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const supabase = getAdminSupabase()
    const { data: charities, error } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return NextResponse.json(charities)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json()
    const supabase = getAdminSupabase()

    if (action === 'CREATE') {
      const { error } = await supabase.from('charities').insert([payload])
      if (error) throw new Error(error.message)
      return NextResponse.json({ success: true })
    }
    
    if (action === 'UPDATE') {
      const { id, ...updates } = payload
      const { error } = await supabase.from('charities').update(updates).eq('id', id)
      if (error) throw new Error(error.message)
      return NextResponse.json({ success: true })
    }
    
    if (action === 'DELETE') {
      const { id } = payload
      const { error } = await supabase.from('charities').delete().eq('id', id)
      if (error) throw new Error(error.message)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
