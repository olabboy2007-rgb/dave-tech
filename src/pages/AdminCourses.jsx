import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchCourses() {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    if (data) setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this course? This cannot be undone.")) return
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (!error) fetchCourses()
    else alert("Error deleting course. It might be linked to existing applications.")
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Manage Courses</h1>
          <p className="text-slate-400 text-sm mt-1">Add, edit, or remove courses from the platform.</p>
        </div>
        <Link to="/admin/courses/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add New Course
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-elevated text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Fee</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading courses...</td></tr>
              ) : courses.map((course) => (
                <tr key={course.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={course.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <div className="font-medium text-white">{course.title}</div>
                      <div className="text-xs text-slate-500">{course.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{course.fee_range || `₦${course.fee}`}</td>
                  <td className="px-6 py-4 text-slate-300">{course.duration}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Link to={`/admin/courses/${course.id}/edit`} className="p-2 bg-bg-elevated border border-line rounded-lg text-slate-300 hover:text-brand hover:border-brand transition">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => handleDelete(course.id)} className="p-2 bg-bg-elevated border border-line rounded-lg text-slate-300 hover:text-red-400 hover:border-red-400 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && !loading && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No courses found. Click "Add New Course" to create one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}