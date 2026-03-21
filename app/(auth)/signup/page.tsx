'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Charity } from '@/types'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [charityId, setCharityId] = useState('')
  const [contributionPct, setContributionPct] = useState(10)
  
  const [charities, setCharities] = useState<Charity[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingCharities, setFetchingCharities] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const { data, error } = await supabase.from('charities').select('*').eq('is_active', true)
        
        if (error) {
          console.error('Supabase fetch error for charities:', error)
          return
        }

        if (data && data.length > 0) {
          setCharities(data)
          setCharityId(data[0].id)
        }
      } catch (err) {
        console.error('Unexpected error during charity fetch:', err)
      } finally {
        setFetchingCharities(false)
      }
    }

    fetchCharities()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (contributionPct < 10) {
      setError("Minimum contribution is 10%")
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          charity_id: charityId ? charityId : null,
          charity_contribution_pct: contributionPct,
        }
      }
    })

    setLoading(false)
    if (signUpError) {
      setError(signUpError.message)
    } else {
      router.push('/login?message=Account created successfully. Please sign in.')
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
      <div className="space-y-2 text-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Create an account</h2>
        <p className="text-sm text-zinc-400">Join to support your favorite charities</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-zinc-300">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Select Charity</label>
          <select
            value={charityId}
            onChange={(e) => setCharityId(e.target.value)}
            disabled={fetchingCharities}
            className="w-full h-10 px-3 flex items-center bg-zinc-950 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 disabled:opacity-50"
            required
          >
            {fetchingCharities ? (
              <option value="">Loading charities...</option>
            ) : charities.length === 0 ? (
              <option value="">No charities available</option>
            ) : (
              charities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            )}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Contribution Percentage</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="10"
              max="100"
              value={contributionPct}
              onChange={(e) => setContributionPct(Number(e.target.value))}
              className="w-full h-10 px-3 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-white focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              required
            />
            <span className="text-zinc-400 font-medium">%</span>
          </div>
          <p className="text-xs text-zinc-500">Minimum 10% required</p>
        </div>
        
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        
        <button 
          type="submit" 
          disabled={loading || fetchingCharities}
          className="w-full h-10 bg-white text-zinc-950 font-medium rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center mt-4"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-400">Already have an account? </span>
        <Link href="/login" className="text-white hover:underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </div>
  )
}
