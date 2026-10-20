import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Code, Shield, TrendingUp, Zap } from 'lucide-react'
import Header from '../components/Header'

// --- 1. CountUp Component for the Stats ---
function CountUp({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [end, duration])

  return <span>{count}{suffix}</span>
}

// --- 2. Interactive Glow Card Component ---
function GlowCard({ children, href }) {
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <Link 
      to={href}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative block card p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand/50"
    >
      {/* The Glow Effect */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300 z-0"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(59, 158, 255, 0.15), transparent 40%)`
        }}
      />
      {/* Content Wrapper to keep it above the glow */}
      <div className="relative z-10">
        {children}
      </div>
    </Link>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-base overflow-hidden relative">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      <Header />
      
      <main className="relative z-10">
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 md:pt-32 md:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/30 bg-brand/10 text-brand-light text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(30,124,240,0.2)]">
            <Zap size={14} className="animate-pulse" /> Learn • Build • Grow
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Build Your Future <br className="hidden md:block" />
            With <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-blue-500 drop-shadow-[0_0_30px_rgba(59,158,255,0.4)]">DAVE TECH</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
            Gain real-world tech and digital skills through our hands-on courses. Apply today and take the first step towards a better future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary w-full sm:w-auto px-8 py-4 text-base shadow-[0_0_30px_rgba(30,124,240,0.3)] hover:shadow-[0_0_40px_rgba(30,124,240,0.5)] transition-all">
              Start Application <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost w-full sm:w-auto px-8 py-4 text-base backdrop-blur-sm">
              Login to Dashboard
            </Link>
          </div>

          {/* Animated Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Active Courses', value: 7, suffix: '+' },
              { label: 'Enrolled Students', value: 500, suffix: '+' },
              { label: 'Hours of Content', value: 120, suffix: '+' },
              { label: 'Success Rate', value: 98, suffix: '%' },
            ].map((stat, i) => (
              <div key={i} className="card p-6 bg-white/5 border-line backdrop-blur-sm hover:border-brand/30 transition">
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs md:text-sm text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section with Glow Cards */}
        <section className="mx-auto max-w-6xl px-4 py-20 border-t border-line">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose DAVE TECH?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We provide a premium learning experience designed to get you hired or start your own business.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <GlowCard href="/signup">
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand-light mb-6 transition-transform group-hover:scale-110 group-hover:bg-brand group-hover:text-white duration-300">
                <Code size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Practical Projects</h3>
              <p className="text-slate-400 leading-relaxed">Learn by doing. Build real-world projects that you can add to your portfolio.</p>
            </GlowCard>

            <GlowCard href="/signup">
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand-light mb-6 transition-transform group-hover:scale-110 group-hover:bg-brand group-hover:text-white duration-300">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Expert Instructors</h3>
              <p className="text-slate-400 leading-relaxed">Learn from industry professionals with years of real-world experience.</p>
            </GlowCard>

            <GlowCard href="/signup">
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand-light mb-6 transition-transform group-hover:scale-110 group-hover:bg-brand group-hover:text-white duration-300">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Career Support</h3>
              <p className="text-slate-400 leading-relaxed">Get guidance on how to land your first tech job or start freelancing.</p>
            </GlowCard>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-4xl px-4 py-24 text-center relative">
          <div className="absolute inset-0 bg-brand/5 blur-3xl rounded-full -z-10"></div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to start your tech journey?</h2>
          <p className="text-slate-400 text-lg mb-10">Join hundreds of students who are already building their future with DAVE TECH.</p>
          <Link to="/signup" className="btn-primary px-10 py-4 text-lg inline-flex shadow-[0_0_30px_rgba(30,124,240,0.4)] hover:shadow-[0_0_50px_rgba(30,124,240,0.6)]">
            Create Your Account <ArrowRight size={20} />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line py-8 text-center text-sm text-slate-500 relative z-10 bg-bg-base">
        <p>© {new Date().getFullYear()} DAVE TECH. All rights reserved.</p>
      </footer>
    </div>
  )
}