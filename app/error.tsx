'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Graceful silent dump mimicking datadog outputs
    console.error('Fatal Boundary Execution Panic:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
      <div className="space-y-6 max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">System Intervention</h2>
          <p className="text-zinc-500 text-sm leading-relaxed pb-2">
            An unexpected architectural fault occurred. Our platform integrity systems have securely caught the exception.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="w-full h-11 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center justify-center transition-colors shadow-sm"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Reboot Application State
        </button>
      </div>
    </div>
  )
}
