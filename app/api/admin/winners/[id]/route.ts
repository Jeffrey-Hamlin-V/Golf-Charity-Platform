import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json()
    const supabase = getAdminSupabase()

    const { error } = await supabase
      .from('winners')
      .update(updates)
      .eq('id', params.id)

    if (error) throw new Error(error.message)
    return NextResponse.json({ success: true })
        
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
