'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Loader2, CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react'
import { Profile } from '@/types'

export default function SettingsClient({ profile, email }: { profile: Profile, email: string }) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  
  const [nameLoading, setNameLoading] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [cancelSuccess, setCancelSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameLoading(true)
    setNameError(null)
    setNameSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id)

    if (error) {
      setNameError(error.message)
    } else {
      setNameSuccess(true)
      router.refresh()
      setTimeout(() => setNameSuccess(false), 3000)
    }
    setNameLoading(false)
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to future draws after your current billing period ends.')) {
      return
    }

    setCancelLoading(true)
    setCancelError(null)

    try {
      const res = await fetch('/api/stripe/cancel', {
        method: 'POST'
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      setCancelSuccess(true)
      router.refresh()
    } catch (err: any) {
      setCancelError(err.message)
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-6 text-white">
          <User className="w-5 h-5 text-blue-500" /> Personal Information
        </h2>

        <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email Address</label>
            <input
              type="text"
              value={email}
              disabled
              className="w-full h-10 px-3 bg-zinc-950/50 border border-zinc-800 rounded-lg text-sm text-zinc-500 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-500">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-700 hover:border-zinc-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              required
            />
          </div>

          {nameError && <p className="text-sm text-red-400">{nameError}</p>}
          {nameSuccess && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Profile updated
            </div>
          )}

          <button 
            type="submit" 
            disabled={nameLoading || fullName === profile.full_name}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm"
          >
            {nameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Subscription Section */}
      <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-lg flex items-center gap-2 mb-6 text-white">
          <CreditCard className="w-5 h-5 text-emerald-500" /> Billing & Subscription
        </h2>

        <div className="max-w-md space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Status</p>
              <p className={`font-medium ${profile.subscription_status === 'active' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                {profile.subscription_status === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Plan</p>
              <p className="font-medium text-white capitalize">{profile.subscription_plan || 'None'}</p>
            </div>
            <div className="col-span-2 bg-zinc-950 p-4 border border-zinc-800 rounded-xl">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Current Contribution</p>
              <p className="font-medium text-pink-400">{profile.charity_contribution_pct}% to selected charity</p>
            </div>
          </div>

          {cancelError && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg"><AlertTriangle className="w-4 h-4 inline mr-1"/>{cancelError}</p>}
          {cancelSuccess && <p className="text-sm text-emerald-400 bg-emerald-400/10 p-3 rounded-lg"><CheckCircle2 className="w-4 h-4 inline mr-1"/>Subscription set to cancel at the end of the billing period.</p>}

          {profile.subscription_status === 'active' && !cancelSuccess && (
            <div className="pt-4 border-t border-zinc-800">
              <button 
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
              >
                {cancelLoading && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                Cancel Subscription
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
