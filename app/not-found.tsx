import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
      <div className="space-y-6 max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-7xl font-black text-white tracking-tighter">404</h1>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-200">Page not found</h2>
          <p className="text-zinc-500 text-sm leading-relaxed pb-2">
            We couldn't locate the destination you're attempting to reach. The URL might be broken, or the content has been removed.
          </p>
        </div>
        <Link 
          href="/dashboard" 
          className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-lg flex items-center justify-center transition-colors shadow-sm"
        >
          <Home className="w-4 h-4 mr-2" /> Return to Safety
        </Link>
      </div>
    </div>
  )
}
