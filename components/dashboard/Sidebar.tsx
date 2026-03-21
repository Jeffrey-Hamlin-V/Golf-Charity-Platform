'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Heart, Ticket, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Scores', href: '/scores', icon: Target },
  { name: 'My Charity', href: '/charity', icon: Heart },
  { name: 'Draws', href: '/draws', icon: Ticket },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ 
  userFullName, 
  userEmail 
}: { 
  userFullName: string | null, 
  userEmail: string 
}) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const initials = userFullName 
    ? userFullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : userEmail.substring(0, 2).toUpperCase()

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-zinc-800 min-h-screen text-zinc-300">
        <div className="p-6 border-b border-zinc-800">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            CharityLink
          </Link>
        </div>
        
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{userFullName || 'Subscriber'}</p>
            <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard')
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-zinc-800/50 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800 pb-safe">
        <nav className="flex items-center justify-around p-2">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard')
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive 
                    ? 'text-white' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
                <span className="sr-only">{link.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
