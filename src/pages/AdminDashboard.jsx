import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Clock, CheckCircle, XCircle, CreditCard, GraduationCap, ArrowRight, Plus, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, payments: 0, enrolled: 0 })

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return navigate('/login')

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setApplications(data)
        // Calculate real stats
        setStats({
          total: data.length,
          pending: data.filter(a => a.status === 'Pending Review').length,
          approved: data.filter(a => a.status === 'Approved').length,
          rejected: data.filter(a => a.status === 'Rejected').length,
          payments: data.filter(a => a.payment_status === 'Awaiting Payment' || a.payment_status === 'Payment Under Verification').length,
          enrolled: data.filter(a => a.status === 'Enrolled').length,
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [navigate])

  // Chart Data
  const pieData = [
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    { name: 'Enrolled', value: stats.enrolled, color: '#3b9eff' },
  ].filter(d => d.value > 0)

  // Dummy line chart data for the last 7 days (You can make this dynamic later)
  const lineData = [
    { name: 'Mon', apps: 5 }, { name: 'Tue', apps: 12 }, { name: 'Wed', apps: 8 },
    { name: 'Thu', apps: 20 }, { name: 'Fri', apps: 15 }, { name: 'Sat', apps: 25 }, { name: 'Sun', apps: 18 }
  ]

  if (loading) return <AdminLayout><div className="text-white">Loading dashboard...</div></AdminLayout>

  return (
    <AdminLayout>
      {/* Header & Date */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
            Welcome Back, Admin 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening with your DAVE TECH platform today.</p>
        </div>
        <div className="flex items-center gap-6 bg-bg-card border border-line px-4 py-2 rounded-xl">
          <div className="text-sm">
            <p className="text-slate-500">Today</p>
            <p className="text-white font-medium">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div className="h-8 w-px bg-line"></div>
          <div className="text-sm">
            <p className="text-slate-500">Time</p>
            <p className="text-white font-medium">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Applications', value: stats.total, icon: Users, color: 'text-brand' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-400' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-400' },
          { label: 'Payments Pending', value: stats.payments, icon: CreditCard, color: 'text-blue-400' },
          { label: 'Enrolled Students', value: stats.enrolled, icon: GraduationCap, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <div key={i} className="card p-5 border-t-2 border-t-transparent hover:border-t-brand transition">
            <div className={`flex items-center gap-2 mb-3 ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Line Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-white">Application Overview</h2>
            <select className="bg-bg-elevated border border-line text-sm text-slate-300 rounded-lg px-3 py-1 outline-none">
              <option>Last 7 days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b9eff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b9eff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1e293b', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="apps" stroke="#3b9eff" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-6">Application Status</h2>
          {pieData.length > 0 ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1e293b', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-4 text-xs">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                    <span className="text-slate-400">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="h-64 flex items-center justify-center text-slate-500">No data to display</div>
          )}
        </div>
      </div>

      {/* Table & Activity Row */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="p-6 border-b border-line flex justify-between items-center">
            <h2 className="font-semibold text-white">Recent Applications</h2>
            <Link to="/admin" className="text-sm text-brand-light hover:underline flex items-center gap-1">View All <ArrowRight size={14}/></Link>
          </div>
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
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{app.full_name}</div>
                      <div className="text-xs text-slate-500">{app.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300 capitalize">{app.course_slug.replace('-', ' ')}</div>
                      <div className="text-xs text-slate-500">{app.attendance}</div>
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
                {applications.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No applications yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 bg-bg-elevated border border-line p-3 rounded-xl hover:border-brand text-slate-300 hover:text-white transition text-sm">
              <Plus size={16} /> Add New Course
            </button>
            <button className="w-full flex items-center gap-3 bg-bg-elevated border border-line p-3 rounded-xl hover:border-brand text-slate-300 hover:text-white transition text-sm">
              <Activity size={16} /> View All Applications
            </button>
            <button className="w-full flex items-center gap-3 bg-bg-elevated border border-line p-3 rounded-xl hover:border-brand text-slate-300 hover:text-white transition text-sm">
              <CreditCard size={16} /> Verify Payment
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}