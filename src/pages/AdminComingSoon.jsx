import AdminLayout from '../components/AdminLayout'
import { Construction } from 'lucide-react'

export default function AdminComingSoon() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Construction size={64} className="text-brand mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Page Under Construction</h1>
        <p className="text-slate-400">This feature is currently being built and will be available soon.</p>
      </div>
    </AdminLayout>
  )
}