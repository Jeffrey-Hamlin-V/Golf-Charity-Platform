import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const supabase = getAdminSupabase()
    
    const { data: winners, error } = await supabase
      .from('winners')
      .select('*, profiles(full_name, email), draws(month)')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return NextResponse.json(winners)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
