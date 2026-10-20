import { Link, useParams, Navigate } from 'react-router-dom'
import { Clock, Tag, Users, Calendar, Check, Heart } from 'lucide-react'
import Header from '../components/Header'
import { courses } from '../data/Courses'

export default function CourseDetail() {
  const { slug } = useParams()
  const course = courses.find((c) => c.slug === slug)
  if (!course) return <Navigate to="/courses" replace />

  return (
    <div className="min-h-screen bg-bg-base">
      <Header back right={<button className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5"><Heart size={20} /></button>} />
      <main className="mx-auto max-w-md px-4 pb-8 pt-4 md:max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-line">
          <img src={course.image} alt="" className="h-48 w-full object-cover" />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-white">{course.title}</h1>
          {course.popular && <span className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">Most Popular</span>}
        </div>
        <p className="mt-1 text-sm text-slate-400">{course.tagline}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { icon: Clock, label: 'Duration', value: course.duration },
            { icon: Tag, label: 'Fee', value: course.feeRange },
            { icon: Users, label: 'Attendance', value: course.attendance.join(' & ') },
            { icon: Calendar, label: 'Schedule', value: course.schedule },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card-elevated p-3">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500"><Icon size={12} /> {label}</div>
              <div className="mt-1 text-sm font-medium text-white">{value}</div>
            </div>
          ))}
        </div>
        <h2 className="mt-6 text-base font-semibold text-white">What you'll learn</h2>
        <ul className="mt-2 space-y-1.5">
          {course.learn.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-emerald-400" /> {item}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link to={`/register?course=${course.slug}`} className="btn-primary w-full">Start Application</Link>
        </div>
      </main>
    </div>
  )
}