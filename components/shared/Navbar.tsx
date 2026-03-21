import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Menu, UserCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const signOut = async () => {
    'use server'
    const supabaseAction = createClient()
    await supabaseAction.auth.signOut()
    redirect('/login')
  }

  return (
    <nav className="w-full h-16 bg-zinc-950 border-b border-zinc-800 text-zinc-50 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          CharityLink
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/charities" className="hover:text-white transition-colors">Charities</Link>
          <Link href="/how-it-works" className="hover:text-white transition-colors">How it Works</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden sm:block text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600">
                <UserCircle className="w-7 h-7 text-zinc-400 group-hover:text-white transition-colors" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                    Profile
                  </Link>
                  <form action={signOut}>
                    <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors">
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="hidden sm:block text-zinc-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-white text-zinc-950 rounded-md hover:bg-zinc-200 transition-colors shadow-sm font-semibold">
              Subscribe
            </Link>
          </div>
        )}
        <button className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  )
}
