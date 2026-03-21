import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runDraw } from '@/lib/draw-engine'

const getAdminSupabase = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getAdminSupabase()

    // Retrieve original generated numbers for this pending draw container
    const { data: draw } = await supabase.from('draws').select('*').eq('id', params.id).single()
    if (!draw) throw new Error('Draw not found')

    // Determine rollover dynamically
    let rolloverAmount = 0
    const { data: previousDraws } = await supabase.from('draws')
      .select('id, jackpot_amount')
      .eq('status', 'published')
      .order('month', { ascending: false })
      .limit(1)

    if (previousDraws && previousDraws.length > 0) {
      const prev = previousDraws[0]
      const { count } = await supabase.from('winners').select('*', { count: 'exact', head: true })
        .eq('draw_id', prev.id).eq('match_type', 'jackpot')
      
      if (count === 0) rolloverAmount = prev.jackpot_amount
    }

    // Call engine logic strictly as a SIMULATION (no side-effects committed)
    const simulationResult = await runDraw(params.id, draw.numbers, rolloverAmount)

    return NextResponse.json({
      simulation: simulationResult,
      rollover_applied: rolloverAmount > 0,
      rolloverAmount
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
