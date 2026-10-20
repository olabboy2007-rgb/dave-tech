import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Mail, User, Phone } from 'lucide-react'
import Header from '../components/Header'
import ProgressSteps from '../components/ProgressSteps'
import { courses } from '../data/Courses.js'
import { supabase } from '../lib/supabase'

const LEARNING_GOALS = ['Learn new skills', 'Build projects', 'Get a better job', 'Start a business', 'Other']

export default function Register() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselected = params.get('course') || ''

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', courseSlug: preselected,
    attendance: 'Online', schedule: '', experience: 'Beginner', goals: [], notes: '',
  })
  const [errors, setErrors] = useState({})

  const selectedCourse = useMemo(() => courses.find((c) => c.slug === form.courseSlug), [form.courseSlug])

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })) }

  function toggleGoal(goal) {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(goal) ? f.goals.filter((g) => g !== goal) : [...f.goals, goal],
    }))
  }

  function validateStep() {
    const e = {}
    if (step === 1) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required'
      if (!/^\+?[0-9 ]{7,}$/.test(form.phone)) e.phone = 'Valid phone is required'
    }
    if (step === 2) {
      if (!form.courseSlug) e.courseSlug = 'Choose a course'
      if (!form.schedule) e.schedule = 'Choose a schedule'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() { if (validateStep()) setStep((s) => Math.min(4, s + 1)) }
  function back() { if (step === 1) navigate(-1); else setStep((s) => s - 1) }

  // --- FIXED SUBMIT FUNCTION ---
  async function submit() {
    if (!validateStep()) return
    
    // 1. Fetch the current user session directly from Supabase
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      alert("You must be logged in to submit an application.")
      navigate('/login')
      return
    }

    const year = new Date().getFullYear()
    const ref = `DT-${year}-${Math.floor(1000 + Math.random() * 9000)}`
    
    // 2. Insert into database with the user_id
    const { error } = await supabase.from('applications').insert([
      {
        user_id: session.user.id, // <--- THIS FIXES THE SECURITY ERROR
        reference: ref,
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        course_slug: form.courseSlug,
        attendance: form.attendance,
        schedule: form.schedule,
        experience: form.experience,
        goals: form.goals,
        notes: form.notes,
        status: 'Pending Review',
        payment_status: 'Not Available'
      }
    ])

    if (error) {
      alert("Error submitting application: " + error.message)
      console.error(error)
      return
    }

    // 3. Save locally just so the confirmation page knows the course title
    localStorage.setItem(`dave-tech-app:${ref}`, JSON.stringify({ courseTitle: selectedCourse?.title }))
    
    // 4. Go to success page
    navigate(`/confirmation/${ref}`)
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <Header back />
      <main className="mx-auto max-w-md px-4 pb-24 pt-6 md:max-w-2xl">
        <ProgressSteps current={step} total={5} />
        <div className="mt-6">
          {step === 1 && (
            <section>
              <h1 className="text-xl font-extrabold text-white">Personal Information</h1>
              <p className="mt-1 text-sm text-slate-400">Tell us a little about yourself.</p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input className="input pl-9" placeholder="Enter your full name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
                  </div>
                  {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input className="input pl-9" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input className="input pl-9" placeholder="08012345678" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                </div>
              </div>
            </section>
          )}
          {step === 2 && (
            <section>
              <h1 className="text-xl font-extrabold text-white">Course Preferences</h1>
              <p className="mt-1 text-sm text-slate-400">Select your preferred course and details.</p>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="label">Course</label>
                  <select className="input" value={form.courseSlug} onChange={(e) => set('courseSlug', e.target.value)}>
                    <option value="">Select a course</option>
                    {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                  </select>
                  {errors.courseSlug && <p className="mt-1 text-xs text-red-400">{errors.courseSlug}</p>}
                </div>
                <div>
                  <label className="label">Attendance Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedCourse?.attendance ?? ['Online', 'Physical']).map((mode) => (
                      <button key={mode} type="button" onClick={() => set('attendance', mode)} className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${form.attendance === mode ? 'border-brand bg-brand/10 text-brand-light' : 'border-line text-slate-400 hover:bg-white/5'}`}>{mode}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Preferred Schedule</label>
                  <select className="input" value={form.schedule} onChange={(e) => set('schedule', e.target.value)}>
                    <option value="">Select a schedule</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Weekend">Weekend</option>
                  </select>
                  {errors.schedule && <p className="mt-1 text-xs text-red-400">{errors.schedule}</p>}
                </div>
                <div>
                  <label className="label">Experience Level</label>
                  <select className="input" value={form.experience} onChange={(e) => set('experience', e.target.value)}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
              </div>
            </section>
          )}
          {step === 3 && (
            <section>
              <h1 className="text-xl font-extrabold text-white">Learning Goals</h1>
              <p className="mt-1 text-sm text-slate-400">What do you hope to achieve?</p>
              <div className="mt-5 space-y-2">
                {LEARNING_GOALS.map((goal) => {
                  const active = form.goals.includes(goal)
                  return (
                    <button type="button" key={goal} onClick={() => toggleGoal(goal)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-sm transition ${active ? 'border-brand bg-brand/10 text-white' : 'border-line text-slate-300 hover:bg-white/5'}`}>
                      <span>{goal}</span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-brand bg-brand' : 'border-slate-600'}`}>{active && <Check size={12} className="text-white" />}</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-4">
                <label className="label">Additional Information (Optional)</label>
                <textarea className="input min-h-[110px]" placeholder="Tell us about your background..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              </div>
            </section>
          )}
          {step === 4 && (
            <section>
              <h1 className="text-xl font-extrabold text-white">Review Your Information</h1>
              <div className="mt-5 space-y-3">
                <div className="card p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Personal Info</h3>
                  <div className="space-y-1 text-sm text-slate-200">
                    <div>{form.fullName}</div><div className="text-slate-400">{form.email}</div><div className="text-slate-400">{form.phone}</div>
                  </div>
                </div>
                <div className="card p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Course Details</h3>
                  <div className="space-y-1 text-sm text-slate-200">
                    <div>{selectedCourse?.title}</div><div className="text-slate-400">{form.attendance}</div><div className="text-slate-400">{form.schedule} · {form.experience}</div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
        <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg-base/95 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center gap-3 md:max-w-2xl">
            <button onClick={back} className="btn-ghost flex-1"><ArrowLeft size={16} /> Back</button>
            {step < 4 ? (
              <button onClick={next} className="btn-primary flex-1">Next <ArrowRight size={16} /></button>
            ) : (
              <button onClick={submit} className="btn-primary flex-1">Submit <ArrowRight size={16} /></button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}