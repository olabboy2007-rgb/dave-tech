import { Link } from 'react-router-dom'
import { Clock, Users, Tag } from 'lucide-react'

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug}`} className="block card overflow-hidden transition hover:border-brand/40">
      <div className="flex gap-3 p-3">
        <div className="relative h-24 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-bg-elevated">
          <img src={course.image} alt="" className="h-full w-full object-cover" loading="lazy" />
          {course.popular && (
            <span className="absolute left-1 top-1 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Most Popular
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{course.title}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{course.tagline}</p>
          <div className="mt-2 space-y-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5"><Clock size={12} /> {course.duration}</div>
            <div className="flex items-center gap-1.5"><Users size={12} /> {course.attendance.join(' & ')}</div>
            <div className="flex items-center gap-1.5"><Tag size={12} /> {course.feeRange}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}