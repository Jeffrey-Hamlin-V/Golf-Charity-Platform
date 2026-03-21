import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 py-12 text-zinc-400">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <Heart className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="font-black text-xl tracking-tight text-white uppercase">Charity<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-purple-500">Link</span></span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              Empowering communities securely through automated charitable contributions and jackpot disbursements.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Platform Features</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home Sandbox</Link></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">System Architecture</a></li>
              <li><Link href="/signup" className="hover:text-emerald-400 transition-colors">Verified Charities</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Account Portal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-emerald-400 transition-colors">Secure Login</Link></li>
              <li><Link href="/signup" className="hover:text-emerald-400 transition-colors">Register Identity</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">User Hub</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-xs">
          <p>© 2026 CharityLink. All system rights logically reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
             <span className="hover:text-white cursor-pointer transition-colors">Privacy Infrastructure</span>
             <span className="hover:text-white cursor-pointer transition-colors">Terms of Processing</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
