import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // We expect the frontend to pass the validated simulation payload so we can directly commit the calculations to prevent mid-air race conditions
    const { simulation, rolloverApplied } = await req.json()
    if (!simulation) throw new Error('Cannot publish without simulation payload')

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Bulk push Draw Entries to link all users' score combinations historically
    if (simulation.entries?.length > 0) {
      const { error: entriesError } = await supabase.from('draw_entries').insert(simulation.entries)
      if (entriesError) throw new Error('Entries Insert Error: ' + entriesError.message)
    }

    // 2. Bulk push Winners so admin has verification tickets
    if (simulation.winners?.length > 0) {
      // Setup payload matching exactly Winners schema: verification_status='pending', payout_status='pending'
      const activeWinners = simulation.winners.map((w: any) => ({
        ...w,
        verification_status: 'pending',
        payout_status: 'pending'
      }))
      const { error: winnersError } = await supabase.from('winners').insert(activeWinners)
      if (winnersError) throw new Error('Winners Insert Error: ' + winnersError.message)
    }

    // 3. Promote original Draw metadata row to published status mapping final pools 
    const { error: drawError } = await supabase
      .from('draws')
      .update({
        status: 'published',
        jackpot_amount: simulation.pools.jackpot,
        pool_4match: simulation.pools.pool4match,
        pool_3match: simulation.pools.pool3match,
        jackpot_rollover: rolloverApplied
      })
      .eq('id', params.id)
      
    if (drawError) throw new Error('Draw Update Error: ' + drawError.message)

    return NextResponse.json({ success: true, message: 'Draw successfully published and locked.' })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
