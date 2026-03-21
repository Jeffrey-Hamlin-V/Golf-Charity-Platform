'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Heart, Loader2, CheckCircle2 } from 'lucide-react'
import { Charity } from '@/types'

export default function CharityClient({ 
  userId, 
  initialCharityId, 
  initialContributionPct, 
  charities 
}: { 
  userId: string, 
  initialCharityId: string, 
  initialContributionPct: number, 
  charities: Charity[] 
}) {
  const [selectedId, setSelectedId] = useState(initialCharityId)
  const [pct, setPct] = useState(initialContributionPct)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (pct < 10 || pct > 100) {
      setError('Contribution percentage must be between 10% and 100%')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        charity_id: selectedId,
        charity_contribution_pct: pct
      })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
      router.refresh()
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Configuration Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-lg flex items-center gap-2 mb-6 text-white">
            <Heart className="w-5 h-5 text-pink-500" /> Select a Cause
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {charities.map((c) => (
              <div 
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                  selectedId === c.id 
                    ? 'border-pink-500 bg-pink-500/10 shadow-sm' 
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <h3 className={`font-bold mb-2 ${selectedId === c.id ? 'text-white' : 'text-zinc-300'}`}>
                  {c.name}
                </h3>
                <p className={`text-xs line-clamp-3 ${selectedId === c.id ? 'text-pink-100/70' : 'text-zinc-500'}`}>
                  {c.description}
                </p>
                {selectedId === c.id && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-pink-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm sticky top-6">
          <h2 className="font-semibold text-lg text-white mb-6">Contribution</h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300 flex justify-between">
                <span>Percentage</span>
                <span className="text-pink-400 font-bold">{pct}%</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                className="w-full accent-pink-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-zinc-500 leading-relaxed">
                Choose what percentage of your subscription fee goes directly to your selected charity. Minimum 10%.
              </p>
            </div>

            {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
            
            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
              </div>
            )}

            <button 
              onClick={handleSave}
              disabled={loading || !selectedId}
              className="w-full h-11 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
