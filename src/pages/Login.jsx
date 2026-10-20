import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Log the user in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2. Check if they are an admin or a student
    // Using maybeSingle() prevents crashing if no profile is found
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .maybeSingle()

    // --- DEBUG LOG ---
    console.log("LOGIN SUCCESSFUL. PROFILE DATA:", profile)
    if (profileError) console.error("PROFILE ERROR:", profileError)

    // 3. Redirect based on their role
    if (profile && profile.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo size={40} />
        </div>
        
        <div className="card p-6">
          <h1 className="mb-2 text-xl font-extrabold text-white text-center">Welcome Back</h1>
          <p className="mb-6 text-sm text-slate-400 text-center">Sign in to your account.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  className="input pl-9"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  className="input pl-9"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <p className="mt-4 text-center text-sm text-slate-400">
            Don't have an account? <Link to="/signup" className="text-brand-light hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}