import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, BookOpen, CreditCard, MessageSquare, User, Settings, LogOut, Menu, Bell, Search, X } from 'lucide-react'
import Logo from './Logo'
import { supabase } from '../lib/supabase'

export default function StudentLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (data) setProfile(data)
    }
    fetchProfile()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Applications', icon: FileText, path: '/dashboard/applications' },
    { name: 'My Courses', icon: BookOpen, path: '/dashboard/courses' },
    { name: 'Payments', icon: CreditCard, path: '/dashboard/payments' },
    { name: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
    { name: 'Profile', icon: User, path: '/dashboard/profile' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
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
        
        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-brand text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-line">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition">
            <LogOut size={18} />
            <span>Logout</span>
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
              placeholder="Search for courses, applications, or anything..." 
              className="w-full bg-bg-elevated border border-line rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 border border-line px-1.5 py-0.5 rounded">⌘K</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-white relative">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 border-l border-line pl-6 cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-brand flex items-center justify-center text-white font-bold overflow-hidden">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{profile?.full_name || 'Student'}</p>
                <p className="text-xs text-slate-400">Student</p>
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