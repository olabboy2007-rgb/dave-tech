import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, CheckCircle, Clock, ArrowRight, X, 
  BookOpen, CreditCard, Calendar, Headphones, Award 
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import StudentLayout from '../components/StudentLayout'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Payment Modal State
  const [payingApp, setPayingApp] = useState(null)
  const [paymentRef, setPaymentRef] = useState('')
  const [receiptFile, setReceiptFile] = useState(null) // Added receipt state
  const [submittingPayment, setSubmittingPayment] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (profileData) setProfile(profileData)

      const { data: appData } = await supabase.from('applications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      
      const { data: coursesData } = await supabase.from('courses').select('slug, fee')
      const courseMap = coursesData?.reduce((acc, c) => ({ ...acc, [c.slug]: c.fee }), {}) || {}

      if (appData) {
        const appsWithFees = appData.map(app => ({
          ...app,
          fee: courseMap[app.course_slug] || 50000
        }))
        setApplications(appsWithFees)
      }
      
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handlePaymentSubmit() {
    if (!paymentRef.trim()) return alert("Please enter a transaction reference")
    if (!receiptFile) return alert("Please upload a screenshot of your payment receipt")

    setSubmittingPayment(true)

    try {
      // 1. Upload Image to Supabase Storage
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `${payingApp.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile)

      if (uploadError) throw new Error(uploadError.message)

      // 2. Get public URL
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName)
      const uploadedUrl = urlData.publicUrl

      // 3. Update Database
      const newNotes = `${payingApp.notes || ''} | Payment Ref: ${paymentRef}`
      const { error: dbError } = await supabase
        .from('applications')
        .update({ 
          payment_status: 'Payment Under Verification', 
          notes: newNotes,
          payment_receipt_url: uploadedUrl
        })
        .eq('id', payingApp.id)

      if (dbError) throw new Error(dbError.message)

      // Success
      setApplications(apps => apps.map(a => a.id === payingApp.id ? { ...a, payment_status: 'Payment Under Verification', notes: newNotes, payment_receipt_url: uploadedUrl } : a))
      setPayingApp(null)
      setPaymentRef('')
      setReceiptFile(null)
      alert("Payment submitted successfully! Admin will verify shortly.")

    } catch (error) {
      console.error(error)
      alert("Error: " + error.message)
    } finally {
      setSubmittingPayment(false)
    }
  }

  if (loading) return <StudentLayout><div className="p-8 text-white">Loading dashboard...</div></StudentLayout>

  const totalApps = applications.length
  const pendingApps = applications.filter(a => a.status === 'Pending Review').length
  const approvedApps = applications.filter(a => a.status === 'Approved').length
  const enrolledApps = applications.filter(a => a.status === 'Enrolled').length

  const getProgress = (status) => {
    if (status === 'Rejected') return { step: -1, label: 'Rejected' }
    if (status === 'Enrolled') return { step: 4, label: 'Enrolled' }
    if (status === 'Approved') return { step: 3, label: 'Payment Pending' }
    if (status === 'More Information Requested') return { step: 2, label: 'Action Required' }
    return { step: 2, label: 'Under Review' } 
  }

  return (
    <StudentLayout>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1730] to-[#0b1120] p-8 md:p-10 mb-8 border border-line">
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Welcome back, <span className="text-brand-light">{profile?.full_name?.split(' ')[0] || 'Student'}</span> 👋
          </h1>
          <p className="text-slate-400 text-lg">Keep learning, keep growing. Your future is in your hands.</p>
        </div>
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/3 bg-cover bg-center opacity-40 mix-blend-screen" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop')" }}></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 border-t-2 border-t-brand">
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium"><FileText size={18} className="text-brand-light"/> Total Applications</div>
          <div className="text-3xl font-bold text-white">{totalApps}</div>
          <div className="text-xs text-slate-500 mt-2 .text-emerald-400 {
 --tw-text-opacity: 1;
 color: rgb(52 211 153 / var(--tw-text-opacity)) /* #34d399 */;
}  ">↑ 1 this month</div>
        </div>
        <div className="card p-5 border-t-2 border-t-amber-500">
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium"><Clock size={18} className="text-amber-400"/> Pending Review</div>
          <div className="text-3xl font-bold text-white">{pendingApps}</div>
          <div className="text-xs text-slate-500 mt-2">Waiting for admin</div>
        </div>
        <div className="card p-5 border-t-2 border-t-emerald-500">
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium"><CheckCircle size={18} className="text-emerald-400"/> Approved</div>
          <div className="text-3xl font-bold text-white">{approvedApps}</div>
          <div className="text-xs text-slate-500 mt-2">Ready for payment</div>
        </div>
        <div className="card p-5 border-t-2 border-t-purple-500">
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium"><CheckCircle size={18} className="text-purple-400"/> Enrolled Courses</div>
          <div className="text-3xl font-bold text-white">{enrolledApps}</div>
          <div className="text-xs text-slate-500 mt-2">Active enrollments</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-line flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><FileText size={18} className="text-brand-light"/> My Applications</h2>
              <Link to="/dashboard/applications" className="text-sm text-brand-light hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-elevated text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Reference No.</th>
                    <th className="px-6 py-4 font-medium">Course</th>
                    <th className="px-6 py-4 font-medium">Applied On</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {applications.slice(0, 3).map((app) => (
                    <tr key={app.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4"><div className="font-medium text-white">{app.reference}</div></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center text-brand"><BookOpen size={14} /></div>
                          <div>
                            <div className="font-medium text-white capitalize">{app.course_slug.replace(/-/g, ' ')}</div>
                            <div className="text-xs text-slate-500">{app.schedule} · ₦{Number(app.fee || 50000).toLocaleString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-300">{new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${
                            app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                            app.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                            app.status === 'Enrolled' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>{app.status}</span>
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500">You haven't applied for any courses yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-6">Application Progress</h2>
            {applications.length > 0 ? (
              (() => {
                const app = applications[0]; 
                const progress = getProgress(app.status);
                return (
                  <div>
                    <div className="flex items-center justify-between mb-8 relative">
                      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-line -z-10"></div>
                      {[{ label: 'Submitted', icon: FileText }, { label: 'Review', icon: Clock }, { label: 'Payment', icon: CreditCard }, { label: 'Enrolled', icon: CheckCircle }].map((step, idx) => {
                        const stepNum = idx + 1;
                        const isActive = progress.step >= stepNum;
                        const isCurrent = progress.step === stepNum;
                        return (
                          <div key={step.label} className="flex flex-col items-center bg-bg-card px-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${isActive ? 'border-brand bg-brand text-white' : 'border-line bg-bg-elevated text-slate-500'} ${isCurrent ? 'ring-4 ring-brand/20' : ''}`}>
                              <step.icon size={18} />
                            </div>
                            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="bg-bg-elevated border border-line rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand flex-shrink-0"><BookOpen size={24} /></div>
                        <div>
                          <div className="font-bold text-white capitalize">{app.course_slug.replace(/-/g, ' ')}</div>
                          <div className="text-sm text-slate-400">{app.schedule} · ₦{Number(app.fee || 50000).toLocaleString()}</div>
                        </div>
                        <span className={`ml-auto md:ml-4 inline-flex rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${
                            app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                            app.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                            app.status === 'Enrolled' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>{progress.label}</span>
                      </div>
                      <div className="text-sm text-slate-400 border-t md:border-t-0 md:border-l border-line pt-4 md:pt-0 md:pl-4 w-full md:w-auto text-center md:text-left flex-shrink-0">
                        {app.status === 'Approved' && <button onClick={() => setPayingApp(app)} className="btn-primary w-full py-2 px-4 text-xs">Pay Now</button>}
                        {app.status === 'Enrolled' && <span className="text-emerald-400 font-medium">You are enrolled!</span>}
                        {(app.status === 'Pending Review' || app.status === 'More Information Requested') && <span>We will notify you once reviewed.</span>}
                        {app.status === 'Rejected' && <span className="text-red-400">Application rejected.</span>}
                      </div>
                    </div>
                  </div>
                )
              })()
            ) : <div className="text-center py-8 text-slate-500">No active application to track.</div>}
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/courses" className="bg-bg-elevated border border-line p-4 rounded-xl flex flex-col items-center justify-center text-center hover:border-brand transition group">
                <BookOpen size={24} className="text-brand-light mb-2 group-hover:scale-110 transition" /><span className="text-xs font-medium text-white">Browse<br/>Courses</span>
              </Link>
              <Link to="/dashboard/applications" className="bg-bg-elevated border border-line p-4 rounded-xl flex flex-col items-center justify-center text-center hover:border-brand transition group">
                <FileText size={24} className="text-brand-light mb-2 group-hover:scale-110 transition" /><span className="text-xs font-medium text-white">View My<br/>Applications</span>
              </Link>
              <Link to="/dashboard/payments" className="bg-bg-elevated border border-line p-4 rounded-xl flex flex-col items-center justify-center text-center hover:border-brand transition group">
                <CreditCard size={24} className="text-brand-light mb-2 group-hover:scale-110 transition" /><span className="text-xs font-medium text-white">Make<br/>Payment</span>
              </Link>
              <a href="https://wa.me/2349073852732" target="_blank" rel="noreferrer" className="bg-bg-elevated border border-line p-4 rounded-xl flex flex-col items-center justify-center text-center hover:border-brand transition group">
                <Headphones size={24} className="text-brand-light mb-2 group-hover:scale-110 transition" /><span className="text-xs font-medium text-white">Contact<br/>Support</span>
              </a>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Upcoming Classes</h2>
              <Link to="/dashboard/courses" className="text-xs text-brand-light hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {applications.filter(a => a.status === 'Enrolled').slice(0, 2).map(app => (
                <div key={app.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand flex-shrink-0 mt-1"><Calendar size={18} /></div>
                  <div>
                    <div className="font-medium text-sm text-white capitalize">{app.course_slug.replace(/-/g, ' ')}</div>
                    <div className="text-xs text-slate-400">{app.attendance} · {app.schedule}</div>
                  </div>
                </div>
              ))}
              {applications.filter(a => a.status === 'Enrolled').length === 0 && <div className="text-sm text-slate-500">No upcoming classes yet.</div>}
            </div>
          </div>
          <div className="card p-6 bg-gradient-to-br from-[#0b1730] to-bg-card border-line">
            <div className="flex items-center gap-3 mb-2"><Headphones size={24} className="text-brand-light" /><h2 className="text-lg font-bold text-white">Need Help?</h2></div>
            <p className="text-sm text-slate-400 mb-4">Have questions or need support? Our team is here to help you.</p>
            <a href="https://wa.me/2349073852732" target="_blank" rel="noreferrer" className="btn-primary w-full py-2 text-sm">Contact Support</a>
          </div>
        </div>
      </div>

      {/* Payment Modal with Receipt Upload */}
      {payingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="card w-full max-w-md p-6 relative">
            <button onClick={() => setPayingApp(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-xl font-bold text-white mb-2">Complete Payment</h2>
            <p className="text-sm text-slate-400 mb-4">
              Please transfer <strong>₦{Number(payingApp.fee || 50000).toLocaleString()}</strong> to:
              <br />Bank: <strong className="text-white">SmartCash PSB</strong>
              <br />Account No: <strong className="text-white">9073852732</strong>
              <br />Account Name: <strong className="text-white">Bowofunoluwa Oladega David</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="label">Transaction Reference</label>
                <input className="input" placeholder="e.g. TRX-123456789" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
              </div>
              <div>
                <label className="label">Upload Receipt (Required)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setReceiptFile(e.target.files[0])}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand-light hover:file:bg-brand/20"
                />
              </div>
              <button onClick={handlePaymentSubmit} disabled={submittingPayment} className="btn-primary w-full mt-2">
                {submittingPayment ? 'Uploading & Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}