import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Phone } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function SignUp() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e) {
    e.preventDefault()
    if (form.password !== form.confirm) return setError("Passwords do not match")
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName, phone: form.phone }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Check if email verification is required
      if (data.session) {
        // If session exists, email confirmation is OFF. Go to dashboard.
        navigate('/dashboard')
      } else {
        // If session is null, email confirmation is ON. 
        alert("Account created! Please check your email for a verification link before logging in.")
        navigate('/login')
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size={40} /></div>
        <div className="card p-6">
          <h1 className="mb-2 text-xl font-extrabold text-white text-center">Create Your Account</h1>
          
          {error && <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required className="input pl-9" placeholder="John Doe" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="email" className="input pl-9" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required className="input pl-9" placeholder="08012345678" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="password" className="input pl-9" placeholder="••••••••" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input required type="password" className="input pl-9" placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({...form, confirm: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-brand-light hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}