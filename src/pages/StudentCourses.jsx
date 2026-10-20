import { useEffect, useState } from 'react'
import { BookOpen, Calendar, Video } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StudentLayout from '../components/StudentLayout'

export default function StudentCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEnrolled() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase.from('applications').select('*').eq('user_id', session.user.id).eq('status', 'Enrolled')
      if (data) setCourses(data)
      setLoading(false)
    }
    fetchEnrolled()
  }, [])

  return (
    <StudentLayout>
      <h1 className="text-2xl font-extrabold text-white mb-6">My Enrolled Courses</h1>
      
      {loading ? <div className="text-white">Loading...</div> : courses.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">You are not enrolled in any courses yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div key={course.id} className="card overflow-hidden group">
              <div className="h-32 bg-brand/20 flex items-center justify-center relative overflow-hidden">
                <BookOpen size={48} className="text-brand/50 group-hover:scale-110 transition duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white capitalize mb-2">{course.course_slug.replace(/-/g, ' ')}</h3>
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2"><Calendar size={16} /> {course.schedule}</div>
                  <div className="flex items-center gap-2"><Video size={16} /> {course.attendance}</div>
                </div>
                <button className="btn-ghost w-full mt-6 text-sm">Join Class Link</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  )
}