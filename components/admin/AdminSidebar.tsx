'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Ticket, Heart, Trophy, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Draws', href: '/admin/draws', icon: Ticket },
  { name: 'Charities', href: '/admin/charities', icon: Heart },
  { name: 'Winners', href: '/admin/winners', icon: Trophy },
]

export default function AdminSidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 border-r border-zinc-900 bg-black flex flex-col hidden md:flex h-full">
      <div className="h-16 flex items-center px-6 border-b border-zinc-900">
        <Heart className="w-6 h-6 text-pink-500 mr-2" />
        <span className="font-bold text-lg tracking-tight text-white uppercase tracking-wider text-sm text-pink-500">Admin Portal</span>
      </div>

      <div className="p-6 pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 font-bold text-zinc-300">
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Administrator</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-pink-500/10 text-pink-500' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-900">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
