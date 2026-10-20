import { useEffect, useState } from 'react'
import { Save, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StudentLayout from '../components/StudentLayout'

export default function StudentProfile() {
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setEmail(session.user.email)

      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', profile.id)
    if (!error) setMessage('Profile updated successfully!')
    else setMessage('Error saving profile.')
    setSaving(false)
  }

  if (loading) return <StudentLayout><div className="text-white">Loading...</div></StudentLayout>

  return (
    <StudentLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-extrabold text-white mb-6">My Profile</h1>
        <div className="card p-6">
          {message && <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400">{message}</div>}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input disabled className="input bg-bg-base opacity-50" value={email} />
            </div>
            <div>
              <label className="label">Full Name</label>
              <input required className="input" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </StudentLayout>
  )
}