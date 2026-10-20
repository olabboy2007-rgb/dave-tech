import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Calendar, BookOpen, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminStudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Fetch profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', id).single()
      if (profileData) setStudent(profileData)

      // Fetch applications for this user
      const { data: appData } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
      
      if (appData) setApplications(appData)
      setLoading(false)
    }
    fetchData()
  }, [id])

  if (loading) return <AdminLayout><div className="text-white">Loading...</div></AdminLayout>
  if (!student) return <AdminLayout><div className="text-white">Student not found.</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/admin/students')} className="p-2 bg-bg-elevated rounded-lg hover:bg-white/5">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Student Profile</h1>
          <p className="text-slate-400 text-sm">Viewing details for {student.full_name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 text-center">
            <div className="h-24 w-24 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-4xl mx-auto mb-4">
              {student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{student.full_name}</h2>
            <p className="text-sm text-slate-400 capitalize">{student.role}</p>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Mail size={16} className="text-slate-500" /> {student.email || 'No email provided'}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Phone size={16} className="text-slate-500" /> {student.phone || 'No phone provided'}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Calendar size={16} className="text-slate-500" /> Joined {new Date(student.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Applications */}
        <div className="md:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-line">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><FileText size={18} className="text-brand-light"/> Application History</h2>
            </div>
            <div className="divide-y divide-line">
              {applications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">This student hasn't applied for any courses yet.</div>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/5 transition">
                    <div>
                      <div className="font-medium text-white capitalize flex items-center gap-2">
                        <BookOpen size={16} className="text-brand-light"/> {app.course_slug.replace(/-/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Ref: {app.reference} · {new Date(app.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${
                          app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                          app.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                          app.status === 'Enrolled' ? 'bg-brand/10 text-brand-light' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {app.status}
                        </span>
                       <Link to={`/admin/application/${app.id}`} className="text-brand-light hover:underline text-sm font-medium">Manage</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}