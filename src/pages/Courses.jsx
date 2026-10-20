
import { Search } from 'lucide-react'
import Header from '../components/Header'
import CourseCard from '../components/CourseCard'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Courses() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [courses, setCourses] = useState([])
  const courseCategories = ['All', 'Web Dev', 'Design', 'AI', 'Video', 'Photo', 'Marketing']

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase.from('courses').select('*')
      if (!error && data) setCourses(data)
    }
    fetchCourses()
  }, [])
  const filtered = courses.filter((c) => {
    const matchesCat = cat === 'All' || c.category === cat
    const q = query.toLowerCase().trim()
    const matchesQuery = !q || c.title.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q)
    return matchesCat && matchesQuery
  })

  return (
    <div className="min-h-screen bg-bg-base">
      <Header back />
      <main className="mx-auto max-w-md px-4 pb-16 pt-6 md:max-w-2xl">
        <h1 className="text-2xl font-extrabold text-white">Our Courses</h1>
        <p className="mt-1 text-sm text-slate-400">Choose a course that fits your goals and start your journey with us.</p>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-bg-elevated px-3 py-2.5">
          <Search size={16} className="text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {courseCategories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`chip whitespace-nowrap ${cat === c ? 'chip-active' : ''}`}>{c}</button>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-line bg-bg-card p-6 text-center text-sm text-slate-400">No courses match your search.</p>
          ) : (
            filtered.map((course) => <CourseCard key={course.slug} course={course} />)
          )}
        </div>
      </main>
    </div>
  )
}