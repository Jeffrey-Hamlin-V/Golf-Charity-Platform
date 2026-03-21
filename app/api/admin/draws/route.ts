import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateAlgorithmicDraw, generateRandomDraw } from '@/lib/draw-engine'

const getAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const supabase = getAdminSupabase()
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return NextResponse.json(draws)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { month, logic } = await req.json()
    const supabase = getAdminSupabase()

    // 1. Generate the physical numbers locked to this draw based on the selected logic
    let numbers: number[] = []
    if (logic === 'algorithmic') {
      numbers = await generateAlgorithmicDraw()
    } else {
      numbers = generateRandomDraw()
    }

    // 2. Create the draw container locally (unpushed to end-users until published)
    const { data: draw, error } = await supabase
      .from('draws')
      .insert({
        month,
        logic,
        numbers,
        status: 'upcoming',
        jackpot_amount: 0,
        pool_4match: 0,
        pool_3match: 0,
        jackpot_rollover: false
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json(draw)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
