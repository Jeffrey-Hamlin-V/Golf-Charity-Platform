import WinnersClient from './WinnersClient'

export default function AdminWinnersPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Winners & Payouts</h1>
        <p className="text-zinc-400">Verify user scorecards and track financial prize distributions across all draws.</p>
      </div>

      <WinnersClient />
    </div>
  )
}
