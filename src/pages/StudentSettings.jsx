import { useState } from 'react'
import { Lock, Bell, Save, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StudentLayout from '../components/StudentLayout'

export default function StudentSettings() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Notification toggles (UI state)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.')
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long.')
    }

    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <StudentLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-extrabold text-white mb-6">Account Settings</h1>
        
        <div className="space-y-6">
          {/* Security Settings */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4 border-b border-line pb-4">
              <ShieldCheck size={24} className="text-brand-light" />
              <h2 className="text-lg font-bold text-white">Security & Password</h2>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
            {message && <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">{message}</div>}

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" 
                    required
                    className="input pl-9" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" 
                    required
                    className="input pl-9" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Notification Settings */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4 border-b border-line pb-4">
              <Bell size={24} className="text-brand-light" />
              <h2 className="text-lg font-bold text-white">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Email Notifications</div>
                  <div className="text-sm text-slate-400">Receive updates when your application is approved or requires action.</div>
                </div>
                <button 
                  onClick={() => setEmailNotifs(!emailNotifs)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${emailNotifs ? 'bg-brand' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailNotifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">SMS Notifications</div>
                  <div className="text-sm text-slate-400">Receive text message alerts for payment confirmations.</div>
                </div>
                <button 
                  onClick={() => setSmsNotifs(!smsNotifs)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${smsNotifs ? 'bg-brand' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${smsNotifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}