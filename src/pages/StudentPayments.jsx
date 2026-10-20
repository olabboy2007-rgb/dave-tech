import { useEffect, useState } from 'react'
import { CreditCard, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StudentLayout from '../components/StudentLayout'

export default function StudentPayments() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingApp, setPayingApp] = useState(null)
  const [paymentRef, setPaymentRef] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function fetchApps() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    
    const { data: appData } = await supabase.from('applications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
    const { data: coursesData } = await supabase.from('courses').select('slug, fee')
    const courseMap = coursesData?.reduce((acc, c) => ({ ...acc, [c.slug]: c.fee }), {}) || {}

    if (appData) {
      const appsWithFees = appData.map(app => ({ ...app, fee: courseMap[app.course_slug] || 50000 }))
      setApps(appsWithFees)
    }
    setLoading(false)
  }

  useEffect(() => { fetchApps() }, [])

  async function handlePaymentSubmit() {
    if (!paymentRef.trim()) return alert("Please enter a transaction reference")
    if (!receiptFile) return alert("Please upload a screenshot of your payment receipt")

    setSubmitting(true)

    try {
      // 1. Upload Image to Supabase Storage
      const fileExt = receiptFile.name.split('.').pop()
      const fileName = `${payingApp.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile)

      if (uploadError) throw new Error(uploadError.message)

      // 2. Get the public URL
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName)
      const uploadedUrl = urlData.publicUrl

      // 3. Update Database with Reference, Notes, and Receipt URL
      const newNotes = `${payingApp.notes || ''} | Payment Ref: ${paymentRef}`
      const { error: dbError } = await supabase.from('applications').update({ 
        payment_status: 'Payment Under Verification', 
        notes: newNotes,
        payment_receipt_url: uploadedUrl
      }).eq('id', payingApp.id)

      if (dbError) throw new Error(dbError.message)

      // Success
      setApps(apps.map(a => a.id === payingApp.id ? { ...a, payment_status: 'Payment Under Verification', notes: newNotes, payment_receipt_url: uploadedUrl } : a))
      setPayingApp(null)
      setPaymentRef('')
      setReceiptFile(null)
      alert("Payment submitted successfully! Admin will verify shortly.")

    } catch (error) {
      console.error(error)
      alert("Error: " + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <StudentLayout><div className="text-white">Loading...</div></StudentLayout>

  return (
    <StudentLayout>
      <h1 className="text-2xl font-extrabold text-white mb-6">Payments & Fees</h1>
      
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-elevated text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Course</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {apps.map(app => (
              <tr key={app.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4 capitalize text-white font-medium">{app.course_slug.replace(/-/g, ' ')}</td>
                <td className="px-6 py-4 text-slate-300">₦{Number(app.fee || 50000).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                    app.payment_status === 'Paid and Verified' ? 'bg-emerald-500/10 text-emerald-400' :
                    app.payment_status === 'Payment Under Verification' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {app.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {app.status === 'Approved' && app.payment_status === 'Awaiting Payment' && (
                    <button onClick={() => setPayingApp(app)} className="btn-primary text-xs py-1.5 px-4">Pay Now</button>
                  )}
                  {app.payment_status === 'Payment Under Verification' && (
                    <span className="text-xs text-amber-400">Verifying...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {payingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="card w-full max-w-md p-6 relative">
            <button onClick={() => setPayingApp(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-xl font-bold text-white mb-2">Complete Payment</h2>
            <p className="text-sm text-slate-400 mb-4">
              Transfer <strong>₦{Number(payingApp.fee || 50000).toLocaleString()}</strong> to:<br/>
              Bank: <strong className="text-white">SmartCash PSB</strong><br/>
              Account No: <strong className="text-white">9073852732</strong><br/>
              Account Name: <strong className="text-white">Bowofunoluwa Oladega David</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="label">Transaction Reference</label>
                <input className="input" placeholder="e.g. TRX-123" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
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

              <button onClick={handlePaymentSubmit} disabled={submitting} className="btn-primary w-full mt-2">
                {submitting ? 'Uploading & Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}