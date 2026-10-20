import { useEffect, useState } from 'react'
import { MessageSquare, Bell } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StudentLayout from '../components/StudentLayout'

export default function StudentMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMessages() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('applications').select('*').eq('user_id', session.user.id).not('admin_notes', 'is', null)
      
      if (data) {
        // Filter out the payment reference notes to only show true admin messages
        const validMsgs = data.filter(m => m.admin_notes && !m.admin_notes.includes('Payment Ref:'))
        setMessages(validMsgs)
      }
      setLoading(false)
    }
    fetchMessages()
  }, [])

  return (
    <StudentLayout>
      <h1 className="text-2xl font-extrabold text-white mb-6">Messages & Notifications</h1>
      
      <div className="space-y-4 max-w-3xl">
        {loading ? <div className="text-white">Loading...</div> : messages.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">No messages from the admin yet.</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="card p-5 flex gap-4 border-l-4 border-l-brand">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 text-brand">
                <Bell size={20} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-white capitalize">{msg.course_slug.replace(/-/g, ' ')}</h3>
                  <span className="text-xs text-slate-500">{new Date(msg.updated_at || msg.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{msg.admin_notes}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </StudentLayout>
  )
}