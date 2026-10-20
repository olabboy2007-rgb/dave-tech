import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, BookOpen, CreditCard, Users, User, LogOut, Menu, Search, Bell, X } from 'lucide-react'
import Logo from './Logo'
import { supabase } from '../lib/supabase'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function checkAdminAndFetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData?.role !== 'admin') {
        navigate('/dashboard')
        return
      }

      setProfile(profileData)

      // 1. Count Pending Applications
      const { count: appCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending Review')

      // 2. Count Payments Waiting for Verification
      const { count: payCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'Payment Under Verification')

      // Add them together for the bell icon
      setNotificationCount((appCount || 0) + (payCount || 0))
    }
    
    checkAdminAndFetchData()
  }, [navigate])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Applications', icon: FileText, path: '/admin/applications' },
    { name: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'Profile', icon: User, path: '/admin/profile' },
  ]

  return (
    <div className="min-h-screen bg-bg-base flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-line bg-bg-card">
        <Logo />
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-bg-card border-r border-line transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-6 hidden md:block">
          <Logo />
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">Management</p>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && (item.path !== '/admin' || location.pathname === '/admin')
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-brand text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon size={18} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-line">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition">
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-line bg-bg-base">
          <div className="relative w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search applications, courses, or users..." 
              className="w-full bg-bg-elevated border border-line rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
            />
          </div>
          <div className="flex items-center gap-6">
            {/* Real Notification Bell */}
            <Link to="/admin/applications" className="text-slate-400 hover:text-white relative">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-3 border-l border-line pl-6">
              <div className="h-9 w-9 rounded-full bg-brand flex items-center justify-center text-white font-bold uppercase">
                {profile?.full_name ? profile.full_name.charAt(0) : 'A'}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-slate-400">{profile?.email || 'System Administrator'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}