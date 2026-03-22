import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = getAdminSupabase()
  
  // Fetch detailed draw stats
  const { data: entries } = await supabase.from('draw_entries').select('id').eq('draw_id', params.id)
  const { data: winners } = await supabase.from('winners').select('*, profiles(full_name, email)').eq('draw_id', params.id)
  
  if (!winners) return NextResponse.json({ error: 'Failed to find winners.' }, { status: 500 })

  return NextResponse.json({
    totalEntries: entries?.length || 0,
    winners: winners
  })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = getAdminSupabase()
  
  const { data: draw } = await supabase.from('draws').select('status').eq('id', params.id).single()
  
  if (draw?.status === 'published') {
    return NextResponse.json({ error: 'Cannot delete a fully published draw logic block.' }, { status: 400 })
  }

  // Draw removal, DB constraints will cascade normally or it sits empty without FK attachments
  await supabase.from('draws').delete().eq('id', params.id)

  return NextResponse.json({ success: true })
}
