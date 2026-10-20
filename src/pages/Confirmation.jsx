import { useParams, Link } from 'react-router-dom'
import { CheckCircle2, Copy } from 'lucide-react'
import Header from '../components/Header'

export default function Confirmation() {
  const { ref } = useParams()
  const stored = JSON.parse(localStorage.getItem(`dave-tech-app:${ref}`) || 'null')

  return (
    <div className="min-h-screen bg-bg-base">
      <Header back />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 pb-16 pt-12 text-center md:max-w-2xl">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-brand/20 blur-3xl" />
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-brand/40 bg-bg-elevated">
            <CheckCircle2 size={48} className="text-brand-light" />
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-extrabold text-white">Application Submitted!</h1>
        <p className="mt-2 text-sm text-slate-400">Thank you for applying to DAVE TECH. Your application has been received and is now under review.</p>
        <div className="mt-6 w-full card p-5">
          <p className="text-xs uppercase tracking-wider text-slate-500">Application Reference</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-lg font-bold text-brand-light">{ref}</span>
            <button onClick={() => navigator.clipboard?.writeText(ref)} className="rounded-md p-1 text-slate-400 hover:bg-white/5"><Copy size={14} /></button>
          </div>
          {stored?.courseTitle && <p className="mt-1 text-xs text-slate-500">Course: {stored.courseTitle}</p>}
        </div>
        <div className="mt-6 w-full space-y-3">
          <Link to="/" className="btn-primary w-full">Back to Home</Link>
          <Link to="/courses" className="btn-ghost w-full">View Courses</Link>
        </div>
      </main>
    </div>
  )
}