import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function AdminApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchApp() {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single()
      
      if (data) {
        setApp(data)
        setNotes(data.admin_notes || '')
      }
      setLoading(false)
    }
    fetchApp()
  }, [id])

  async function updateStatus(newStatus) {
    setUpdating(true)
    
    // Prepare update payload
    const updates = { 
      status: newStatus,
      admin_notes: notes
    }

    // If approving, change payment status to Awaiting Payment
    if (newStatus === 'Approved') {
      updates.payment_status = 'Awaiting Payment'
    }

    const { error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)

    if (error) {
      alert("Error updating: " + error.message)
    } else {
      // Refresh local data
      setApp({ ...app, ...updates })
      alert(`Application ${newStatus}!`)
    }
    setUpdating(false)
  }

  if (loading) return <div className="p-8 text-center text-white">Loading...</div>
  if (!app) return <div className="p-8 text-center text-white">Application not found.</div>

  return (
    <div className="min-h-screen bg-bg-base">
      <header className="flex items-center gap-3 border-b border-line bg-bg-card px-4 py-3">
        <button onClick={() => navigate('/admin')} className="text-slate-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <Logo />
      </header>

      <main className="mx-auto max-w-3xl p-4 md:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">{app.full_name}</h1>
            <p className="text-sm text-slate-400">Ref: {app.reference}</p>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 
            app.status === 'Rejected' ? 'bg-red-500/10 text-red-400' : 
            'bg-amber-500/10 text-amber-400'
          }`}>
            {app.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column: Application Info */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact Info</h2>
              <div className="space-y-2 text-sm text-white">
                <p><span className="text-slate-500">Email:</span> {app.email}</p>
                <p><span className="text-slate-500">Phone:</span> {app.phone}</p>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Course Details</h2>
              <div className="space-y-2 text-sm text-white capitalize">
                <p><span className="text-slate-500">Course:</span> {app.course_slug.replace('-', ' ')}</p>
                <p><span className="text-slate-500">Attendance:</span> {app.attendance}</p>
                <p><span className="text-slate-500">Schedule:</span> {app.schedule}</p>
                <p><span className="text-slate-500">Experience:</span> {app.experience}</p>
              </div>
            </div>

            {app.goals && app.goals.length > 0 && (
              <div className="card p-5">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Goals</h2>
                <ul className="list-disc list-inside text-sm text-white space-y-1">
                  {app.goals.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Admin Notes</h2>
              <textarea
                className="input min-h-[120px]"
                placeholder="Add notes for the applicant (e.g., 'Please provide your portfolio link')..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Take Action</h2>
              
              <button 
                onClick={() => updateStatus('Approved')} 
                disabled={updating || app.status === 'Approved'}
                className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700 shadow-none"
              >
                <Check size={16} /> Approve Application
              </button>
              
              <button 
                onClick={() => updateStatus('More Information Requested')} 
                disabled={updating}
                className="btn-ghost w-full text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
              >
                <Clock size={16} /> Request More Info
              </button>

              <button 
                onClick={() => updateStatus('Rejected')} 
                disabled={updating}
                className="btn-ghost w-full text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <X size={16} /> Reject Application
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}