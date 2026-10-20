import { useEffect, useState } from 'react'
import { CheckCircle, Search, ShieldCheck, Receipt } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function fetchPayments() {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .in('status', ['Approved', 'Enrolled'])
      .order('created_at', { ascending: false })
    
    if (data) {
      console.log("ADMIN DATA FETCHED:", data) // Check this in your browser console (F12)
      setPayments(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  async function markAsEnrolled(id) {
    if (!window.confirm("Verify this payment and mark student as Enrolled?")) return
    
    const { error } = await supabase
      .from('applications')
      .update({ 
        payment_status: 'Paid and Verified',
        status: 'Enrolled'
      })
      .eq('id', id)

    if (!error) fetchPayments()
    else alert("Error verifying payment")
  }

  const filtered = payments.filter(p => 
    p.full_name.toLowerCase().includes(search.toLowerCase()) || 
    p.reference.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Payments & Enrollment</h1>
          <p className="text-slate-400 text-sm mt-1">Verify payment references and enroll students.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or reference..." 
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
                <th className="px-6 py-4 font-medium">Payment Info</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading payments...</td></tr>
              ) : filtered.map((app) => (
                <tr key={app.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{app.full_name}</div>
                    <div className="text-xs text-slate-500">{app.reference}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 capitalize">{app.course_slug.replace(/-/g, ' ')}</td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold tracking-wide uppercase ${
                        app.status === 'Enrolled' ? 'bg-brand/10 text-brand-light' :
                        app.payment_status === 'Payment Under Verification' ? 'bg-amber-500/10 text-amber-400' : 
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {app.status === 'Enrolled' ? 'Enrolled' : app.payment_status}
                      </span>
                      
                      {app.notes && app.notes.includes('Payment Ref:') && (
                        <div className="text-xs text-brand-light mt-1 font-mono">
                          Ref: {app.notes.split('Payment Ref:')[1]}
                        </div>
                      )}

                      {/* THIS IS THE CODE THAT SHOWS THE RECEIPT LINK */}
                      {app.payment_receipt_url ? (
                        <a 
                          href={app.payment_receipt_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-light hover:underline mt-2 font-medium bg-brand/10 px-2 py-1 rounded"
                        >
                          <Receipt size={12} /> View Receipt
                        </a>
                      ) : (
                        <div className="text-xs text-red-400 mt-1">No receipt uploaded</div>
                      )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {app.status === 'Approved' ? (
                      <button 
                        onClick={() => markAsEnrolled(app.id)}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition"
                      >
                        <ShieldCheck size={14} /> Verify & Enroll
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-xs font-medium flex items-center justify-end gap-1">
                        <CheckCircle size={14} /> Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No payments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}