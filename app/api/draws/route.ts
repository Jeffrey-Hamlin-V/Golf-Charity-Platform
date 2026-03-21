import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from('draws').select('*')
    
    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('DRAWS_GET_ERROR', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
