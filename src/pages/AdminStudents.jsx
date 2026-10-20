import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, User, Mail, Phone, Calendar, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
      
      if (data) setStudents(data)
      setLoading(false)
    }
    fetchStudents()
  }, [])

  const filtered = students.filter(s => 
    (s.full_name || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search)
  )

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Registered Students</h1>
          <p className="text-slate-400 text-sm mt-1">View all accounts created on the platform.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
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
                <th className="px-6 py-4 font-medium">Contact Info</th>
                <th className="px-6 py-4 font-medium">Date Joined</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading students...</td></tr>
              ) : filtered.map((student) => (
                <tr key={student.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                        {student.full_name ? student.full_name.charAt(0).toUpperCase() : <User size={18} />}
                      </div>
                      <div>
                        <div className="font-medium text-white">{student.full_name || 'Unnamed Student'}</div>
                        <div className="text-xs text-slate-500">ID: {student.id.split('-')[0]}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail size={14} className="text-slate-500" /> {student.email || 'No email'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 mt-1">
                      <Phone size={14} className="text-slate-500" /> {student.phone || 'No phone'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar size={14} className="text-slate-500" />
                      {new Date(student.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/admin/student/${student.id}`} 
                      className="inline-flex items-center gap-2 bg-bg-elevated border border-line px-4 py-2 rounded-lg text-white hover:border-brand transition text-xs font-medium"
                    >
                      <Eye size={14} /> View Profile
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}