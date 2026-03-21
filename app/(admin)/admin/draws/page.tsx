import DrawsClient from './DrawsClient'

export default function AdminDrawsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Draw Management Simulator</h1>
        <p className="text-zinc-400">Create target draw dates, execute jackpot simulations with various algorithms, and permanently publish official draws.</p>
      </div>

      <DrawsClient />
    </div>
  )
}
