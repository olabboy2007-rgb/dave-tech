import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StudentLayout from '../components/StudentLayout'

export default function StudentApplications() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApps() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('applications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      if (data) setApps(data)
      setLoading(false)
    }
    fetchApps()
  }, [])

  return (
    <StudentLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-white">My Applications</h1>
        <Link to="/courses" className="btn-primary text-sm py-2">Apply for Course</Link>
      </div>
      
      <div className="space-y-4">
        {loading ? <div className="text-white">Loading...</div> : apps.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">You haven't applied for any courses yet.</div>
        ) : (
          apps.map(app => (
            <div key={app.id} className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white capitalize">{app.course_slug.replace(/-/g, ' ')}</h3>
                  <p className="text-sm text-slate-400">Ref: {app.reference} · Applied {new Date(app.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${
                  app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                  app.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                  app.status === 'Enrolled' ? 'bg-brand/10 text-brand-light' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {app.status}
                </span>
                <Link to={`/dashboard/payments`} className="text-brand-light hover:underline text-sm font-medium">View Details</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </StudentLayout>
  )
}