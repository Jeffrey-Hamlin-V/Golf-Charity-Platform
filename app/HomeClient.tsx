'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Heart, Trophy, Target, Sparkles, CheckCircle2, Shield } from 'lucide-react'
import Link from 'next/link'
import { Charity } from '@/types'

export default function HomeClient({ charities, latestDraw }: { charities: Charity[], latestDraw: any }) {
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="w-full relative bg-black">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
        {/* Animated Abstract Orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} 
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} 
            className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full" 
          />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }} 
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }} 
            className="absolute top-1/3 right-[-20%] w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full" 
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md text-sm font-medium text-zinc-300 mb-8"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Empowering communities through sport
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1]"
          >
            Play Golf. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-purple-500">
              Change Lives.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
          >
            A modern subscription platform turning your monthly rounds into powerful, automated charitable contributions with a chance to win massive jackpots.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link 
              href="/signup" 
              className="group flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transition-all duration-300"
            >
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent border border-zinc-700 hover:bg-zinc-900 text-white rounded-full font-bold text-lg transition-all duration-300"
            >
              See How It Works
            </button>
          </motion.div>
        </div>

        {/* Live Stat Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-0 left-0 w-full border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-xl py-6"
        >
          <div className="container mx-auto px-4 flex flex-wrap justify-around items-center gap-8 divide-x divide-zinc-800">
            <div className="text-center w-full sm:w-auto">
              <p className="text-3xl font-bold text-white mb-1">€12,450</p>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Raised for Charity</p>
            </div>
            <div className="text-center w-full sm:w-auto pl-8 hidden sm:block">
              <p className="text-3xl font-bold text-white mb-1">1,240</p>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Active Members</p>
            </div>
            <div className="text-center w-full sm:w-auto pl-8 hidden lg:block">
              <p className="text-3xl font-bold text-white mb-1">47</p>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Draws Completed</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-32 relative bg-zinc-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">A Seamless Engine for Good</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">No complicated interfaces. Join the platform, log your standard scores, and let our automated engine direct funds and orchestrate the jackpot.</p>
          </div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { num: '01', icon: Shield, title: 'Subscribe', desc: 'Choose your plan and securely pick a registered charity algorithmically linked to your account.' },
              { num: '02', icon: Target, title: 'Enter Scores', desc: 'Log your monthly Stableford scores (1-45) intuitively after each round directly into the hub.' },
              { num: '03', icon: Trophy, title: 'Win & Give', desc: 'Match numbers in the monthly algorithmic draw. You win cash, your charity wins resources.' }
            ].map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative group bg-zinc-900 border border-zinc-800 p-8 rounded-3xl hover:border-zinc-700 transition-colors">
                <div className="absolute top-6 right-8 text-6xl font-black text-zinc-800/50 group-hover:text-purple-500/10 transition-colors">{step.num}</div>
                <div className="w-14 h-14 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center mb-8 border border-zinc-700 group-hover:border-purple-500/50 transition-colors">
                  <step.icon className="w-6 h-6 text-zinc-300 group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-zinc-400 leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. CHARITY IMPACT SECTION */}
      <section className="py-32 relative bg-black overflow-hidden">
        {/* Abstract Glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
             <div className="max-w-2xl">
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Your game. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Their future.</span></h2>
               <p className="text-zinc-400 text-lg">Direct your subscription directly to causes transforming lives on the ground. You have total granular control over your contribution percentage.</p>
             </div>
             <Link href="/signup" className="text-emerald-400 font-bold hover:text-emerald-300 flex items-center whitespace-nowrap">
                Choose your cause at signup <ArrowRight className="w-4 h-4 ml-2" />
             </Link>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {charities.length > 0 ? charities.map((charity, i) => (
                <motion.div key={charity.id} variants={fadeInUp} className={`group bg-zinc-900 border ${charity.is_featured ? 'border-emerald-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]' : 'border-zinc-800'} rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-colors flex flex-col h-full relative p-6`}>
                  {charity.is_featured && <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30">FEATURED</div>}
                  <Heart className={`w-8 h-8 mb-6 ${charity.is_featured ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <h3 className="text-xl font-bold text-white mb-3">{charity.name}</h3>
                  <p className="text-sm text-zinc-400 mb-6 flex-1">{charity.description}</p>
                </motion.div>
             )) : (
                <div className="col-span-full py-12 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">
                  Charity network configuration pending.
                </div>
             )}
          </motion.div>
        </div>
      </section>

      {/* 4. PRIZE DRAW SECTION */}
      <section className="py-32 bg-zinc-950 relative border-y border-zinc-900">
        <div className="container mx-auto px-4 max-w-6xl">
           <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">The Algorithmic Draw</h2>
              <p className="text-zinc-400 text-lg mb-8">Every subscribed user contributes exactly €5 into the monthly dynamic prize pool. Our secure computational engine draws 5 numbers uniformly to distribute life-changing jackpots.</p>
              
              {latestDraw && (
                <div className="inline-flex flex-col items-center justify-center p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                  <span className="text-xs uppercase tracking-widest font-bold text-emerald-500 mb-2">Latest Historical Jackpot Processed</span>
                  <span className="text-4xl font-black text-white">€{latestDraw.jackpot_amount?.toFixed(2)}</span>
                </div>
              )}
           </div>

           <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-b from-purple-900/40 to-black border border-purple-500/30 p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
                <Trophy className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-2xl font-black text-white mb-2">Jackpot Tier</h3>
                <p className="text-purple-300 text-sm font-medium mb-4">5 Number Perfect Match</p>
                <div className="text-4xl font-bold text-white mb-4">40%</div>
                <p className="text-sm text-zinc-400">Of the total global monthly pool.</p>
                <div className="mt-6 pt-6 border-t border-purple-500/20 text-xs text-purple-400 flex items-center font-medium">
                  * Automatically rolls over if unclaimed.
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-zinc-300 font-bold">2</div>
                <h3 className="text-2xl font-black text-white mb-2">Second Prize</h3>
                <p className="text-zinc-400 text-sm font-medium mb-4">4 Number Match</p>
                <div className="text-4xl font-bold text-white mb-4">35%</div>
                <p className="text-sm text-zinc-500">Of the total global monthly pool, shared equally among all tier winners.</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-zinc-300 font-bold">3</div>
                <h3 className="text-2xl font-black text-white mb-2">Third Prize</h3>
                <p className="text-zinc-400 text-sm font-medium mb-4">3 Number Match</p>
                <div className="text-4xl font-bold text-white mb-4">25%</div>
                <p className="text-sm text-zinc-500">Of the total global monthly pool, shared equally among all tier winners.</p>
              </div>
           </div>
        </div>
      </section>

      {/* 5. SUBSCRIPTION PRICING SECTION */}
      <section className="py-32 bg-black relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
           <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Transparent Commitment</h2>
              <p className="text-zinc-400 text-lg">One flat transparent price. Maximum impact. Zero hidden fees.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl flex flex-col h-full hover:border-zinc-700 transition-colors">
                 <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
                 <p className="text-zinc-400 mb-6">Billed every 30 days.</p>
                 <div className="mb-8">
                   <span className="text-5xl font-black text-white">€9.99</span>
                   <span className="text-zinc-500 font-medium ml-2">/mo</span>
                 </div>
                 <ul className="space-y-4 mb-10 flex-1">
                   {['Full access to platform dashboard', 'Log 5 scores monthly to qualify', 'Guaranteed £5 dynamically routed to prize pools', 'Direct verified charitable contributions'].map(item => (
                     <li key={item} className="flex gap-3 text-zinc-300 text-sm items-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span>{item}</span>
                     </li>
                   ))}
                 </ul>
                 <Link href="/signup" className="w-full block text-center py-4 bg-zinc-100 hover:bg-white text-black font-bold rounded-xl transition-colors">Select Monthly</Link>
              </div>

              <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 border border-emerald-500/50 p-10 rounded-3xl flex flex-col h-full relative overflow-hidden transform md:-translate-y-4 shadow-2xl">
                 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                 <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 uppercase tracking-widest">Recommended</div>
                 <h3 className="text-2xl font-bold text-white mb-2">Yearly</h3>
                 <p className="text-zinc-400 mb-6">Commit long-term to your cause.</p>
                 <div className="mb-8 flex items-end justify-between">
                   <div>
                     <span className="text-5xl font-black text-white">€99.99</span>
                     <span className="text-zinc-500 font-medium ml-2">/yr</span>
                   </div>
                   <span className="text-sm font-bold text-emerald-500 mb-2 mr-2">2 Months Free</span>
                 </div>
                 <ul className="space-y-4 mb-10 flex-1">
                   {['Everything in Monthly Plan', 'Discounted 10-month pricing upfront', 'Priority support routing', 'Exclusive end-of-year platform statistical review'].map(item => (
                     <li key={item} className="flex gap-3 text-zinc-300 text-sm items-start">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span>{item}</span>
                     </li>
                   ))}
                 </ul>
                 <Link href="/signup" className="w-full block text-center py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_20px_-5px_rgba(52,211,153,0.5)]">Select Yearly</Link>
              </div>
           </div>
        </div>
      </section>
    </div>
  )
}
