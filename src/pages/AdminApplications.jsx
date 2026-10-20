import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchApps() {
      const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
      if (data) setApplications(data)
      setLoading(false)
    }
    fetchApps()
  }, [])

  const filteredApps = applications.filter(app => 
    app.full_name.toLowerCase().includes(search.toLowerCase()) || 
    app.email.toLowerCase().includes(search.toLowerCase()) ||
    app.reference.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-extrabold text-white">All Applications</h1>
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, email, or reference..." 
            className="w-full bg-bg-elevated border border-line rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-elevated text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{app.full_name}</div>
                    <div className="text-xs text-slate-500">{app.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-300 capitalize">{app.course_slug.replace(/-/g, ' ')}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${
                        app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                        app.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {app.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/admin/application/${app.id}`} className="inline-block bg-bg-elevated border border-line px-4 py-1.5 rounded-lg text-white hover:border-brand transition text-xs font-medium">View</Link>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No applications found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}