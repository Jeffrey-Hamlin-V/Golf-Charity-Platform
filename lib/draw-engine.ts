import { createClient } from '@supabase/supabase-js'
import { Profile, DrawEntry, Winner } from '@/types'

// Uses the service role client internally to bypass RLS for administrative actions
const getAdminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Returns an array of 5 unique random numbers between 1-45.
 */
export function generateRandomDraw(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

/**
 * Fetches all user scores across the system. Weights draw numbers by frequency (so more common scores have highly weighted probabilities of being selected).
 * Returns array of 5 unique numbers.
 */
export async function generateAlgorithmicDraw(): Promise<number[]> {
  const supabase = getAdminSupabase()
  
  // 1: Fetch all scores
  const { data: scores } = await supabase.from('scores').select('score')
  
  if (!scores || scores.length === 0) {
    // Fallback if system has no scores logged yet
    return generateRandomDraw()
  }

  // 2: Tally frequencies
  const frequencies = new Map<number, number>()
  for (let i = 1; i <= 45; i++) frequencies.set(i, 0)
    
  scores.forEach(({ score }) => {
    if (frequencies.has(score)) {
      frequencies.set(score, frequencies.get(score)! + 1)
    }
  })

  // 3: Build weighted distribution array where highly frequent numbers appear more often
  const distribution: number[] = []
  frequencies.forEach((count, number) => {
    // Add base weight of 1 so unpicked numbers still have a tiny chance
    const weight = count + 1 
    for (let i = 0; i < weight; i++) {
      distribution.push(number)
    }
  })

  // 4: Pick 5 unique numbers
  const selectedNumbers = new Set<number>()
  while (selectedNumbers.size < 5) {
    const randomIdx = Math.floor(Math.random() * distribution.length)
    selectedNumbers.add(distribution[randomIdx])
  }

  return Array.from(selectedNumbers).sort((a, b) => a - b)
}

/**
 * Calculates how many numbers match.
 */
export function calculateMatches(userNumbers: number[], drawnNumbers: number[]): number {
  return userNumbers.filter(num => drawnNumbers.includes(num)).length
}

/**
 * Returns the exact financial pools based strictly on the number of active subscribers.
 * Each subscriber contributes £5 to the total draw pool.
 * Pool is split: 40% -> 5-match jackpot, 35% -> 4-match pool, 25% -> 3-match pool.
 */
export function calculatePrizePool(activeSubscriberCount: number) {
  const totalPool = activeSubscriberCount * 5 // £5 per subscriber
  
  return {
    jackpot: parseFloat((totalPool * 0.40).toFixed(2)),
    pool4match: parseFloat((totalPool * 0.35).toFixed(2)),
    pool3match: parseFloat((totalPool * 0.25).toFixed(2))
  }
}

/**
 * Processes all eligible users given an existing pending draw.
 * 1. Fetches active subscribers and their latest 5 scores.
 * 2. Creates draw_entries.
 * 3. Identifies winners and calculates exact split payouts.
 * 4. Inserts winner records.
 */
export async function runDraw(drawId: string, drawnNumbers: number[], jackpotRolloverAmount = 0): Promise<any> {
  const supabase = getAdminSupabase()

  // Find all active subscribers
  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('id, subscription_status')
    .eq('subscription_status', 'active')
    
  if (!activeUsers) return null

  // Calculate prize pools dynamically based on reality at the exact moment of execution
  let pools = calculatePrizePool(activeUsers.length)
  pools.jackpot += jackpotRolloverAmount // Apply previous month rollover if passed

  // Simulation arrays to bulk DB inserts
  const entriesToInsert: Partial<DrawEntry>[] = []
  const matches = {
    jackpotWinners: [] as string[],
    match4Winners: [] as string[],
    match3Winners: [] as string[]
  }

  for (const user of activeUsers) {
    // Retrieve their ONLY their latest 5 scores via chronological ordering
    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })
      .limit(5)
      
    if (!scores || scores.length < 5) continue; // Must have 5 scores to enter

    const userNumbers = scores.map(s => s.score)
    const matchedCount = calculateMatches(userNumbers, drawnNumbers)

    entriesToInsert.push({
      draw_id: drawId,
      user_id: user.id,
      numbers: userNumbers,
      matched: matchedCount
    })

    if (matchedCount === 5) matches.jackpotWinners.push(user.id)
    else if (matchedCount === 4) matches.match4Winners.push(user.id)
    else if (matchedCount === 3) matches.match3Winners.push(user.id)
  }

  // Calculate exact payouts per head
  const calcPayout = (pool: number, winnerCount: number) => winnerCount > 0 ? parseFloat((pool / winnerCount).toFixed(2)) : 0
  
  const payouts = {
    jackpot: calcPayout(pools.jackpot, matches.jackpotWinners.length),
    match4: calcPayout(pools.pool4match, matches.match4Winners.length),
    match3: calcPayout(pools.pool3match, matches.match3Winners.length)
  }

  const winnersToInsert: Partial<Winner>[] = []

  matches.jackpotWinners.forEach(uid => winnersToInsert.push({ draw_id: drawId, user_id: uid, match_type: 'jackpot', prize_amount: payouts.jackpot }))
  matches.match4Winners.forEach(uid => winnersToInsert.push({ draw_id: drawId, user_id: uid, match_type: '4match', prize_amount: payouts.match4 }))
  matches.match3Winners.forEach(uid => winnersToInsert.push({ draw_id: drawId, user_id: uid, match_type: '3match', prize_amount: payouts.match3 }))

  return {
    pools,
    payouts,
    entries: entriesToInsert,
    winners: winnersToInsert,
    summary: {
      totalEntries: entriesToInsert.length,
      jackpotWinnersCount: matches.jackpotWinners.length,
      match4WinnersCount: matches.match4Winners.length,
      match3WinnersCount: matches.match3Winners.length
    }
  }
}
