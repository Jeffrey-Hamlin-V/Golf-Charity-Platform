'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { animate } from "framer-motion"
import { useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (loading) {
      const controls = animate(0, 90, {
        duration: 2,
        onUpdate: (latest) => setProgress(latest)
      })
      return () => controls.stop()
    } else {
      setProgress(0)
    }
  }, [loading])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
      {loading && <Progress value={progress} className="absolute top-0 left-0 w-full rounded-none h-1 bg-zinc-800 [&>div]:bg-white" />}
      <div className="p-8">
        <div className="space-y-2 text-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h2>
          <p className="text-sm text-zinc-400">Enter your credentials to access your account</p>
        </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
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
        
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full h-10 bg-white text-zinc-950 font-medium rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center mt-2"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing in...</> : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-zinc-400">Don't have an account? </span>
        <Link href="/signup" className="text-white hover:underline underline-offset-4">
          Sign up
        </Link>
      </div>
     </div>
    </div>
  )
}
