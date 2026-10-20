import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import AdminLayout from '../components/AdminLayout'

export default function AdminCourseForm() {
  const { id } = useParams() // If there is an ID, we are editing
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', slug: '', category: 'Web Dev', fee: 50000, fee_range: '',
    duration: '', schedule: '', image: '', tagline: '', popular: false,
    attendance: ['Online', 'Physical'], learn: ''
  })

  useEffect(() => {
    if (!isEditing) return
    async function fetchCourse() {
      const { data } = await supabase.from('courses').select('*').eq('id', id).single()
      if (data) {
        setForm({
          ...data,
          learn: data.learn ? data.learn.join('\n') : '', // Convert array back to text for textarea
          fee_range: data.fee_range || ''
        })
      }
      setLoading(false)
    }
    fetchCourse()
  }, [id, isEditing])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleAttendance(mode) {
    setForm(prev => {
      const current = prev.attendance || []
      return {
        ...prev,
        attendance: current.includes(mode) ? current.filter(m => m !== mode) : [...current, mode]
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    // Auto-generate slug if empty
    const finalSlug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Convert learn textarea back to array
    const learnArray = form.learn.split('\n').filter(item => item.trim() !== '')

    const payload = {
      ...form,
      slug: finalSlug,
      fee: Number(form.fee),
      learn: learnArray
    }

    let error
    if (isEditing) {
      const res = await supabase.from('courses').update(payload).eq('id', id)
      error = res.error
    } else {
      const res = await supabase.from('courses').insert([payload])
      error = res.error
    }

    if (error) {
      alert("Error saving course: " + error.message)
      setSaving(false)
    } else {
      navigate('/admin/courses')
    }
  }

  if (loading) return <AdminLayout><div className="text-white">Loading...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/admin/courses')} className="p-2 bg-bg-elevated rounded-lg hover:bg-white/5">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white">{isEditing ? 'Edit Course' : 'Add New Course'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 max-w-4xl space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label">Course Title</label>
            <input required name="title" className="input" value={form.title} onChange={handleChange} placeholder="e.g. Web Development" />
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" className="input" value={form.category} onChange={handleChange}>
              <option value="Web Dev">Web Dev</option>
              <option value="Design">Design</option>
              <option value="Video">Video</option>
              <option value="Photo">Photo</option>
              <option value="AI">AI</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Tagline (Short description)</label>
          <input required name="tagline" className="input" value={form.tagline} onChange={handleChange} placeholder="Learn to build modern websites..." />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="label">Fee (Number)</label>
            <input required type="number" name="fee" className="input" value={form.fee} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Fee Range (Text)</label>
            <input name="fee_range" className="input" value={form.fee_range} onChange={handleChange} placeholder="e.g. ₦50,000 – ₦80,000" />
          </div>
          <div>
            <label className="label">Duration</label>
            <input required name="duration" className="input" value={form.duration} onChange={handleChange} placeholder="e.g. 6 weeks" />
          </div>
        </div>

        <div>
          <label className="label">Image URL (Unsplash or direct link)</label>
          <input required name="image" className="input" value={form.image} onChange={handleChange} placeholder="https://images.unsplash.com/..." />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="label">Schedule</label>
            <input required name="schedule" className="input" value={form.schedule} onChange={handleChange} placeholder="e.g. Mon, Wed, Fri (Flexible)" />
          </div>
          <div>
            <label className="label">Attendance Options</label>
            <div className="flex gap-4 mt-2">
              {['Online', 'Physical'].map(mode => (
                <label key={mode} className="flex items-center gap-2 text-white cursor-pointer">
                  <input type="checkbox" checked={form.attendance?.includes(mode)} onChange={() => handleAttendance(mode)} className="w-4 h-4 accent-brand" />
                  {mode}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="label">What you'll learn (One topic per line)</label>
          <textarea required className="input min-h-[120px]" value={form.learn} onChange={(e) => setForm({...form, learn: e.target.value})} placeholder="HTML5 & semantic structure&#10;CSS3 & responsive design&#10;JavaScript fundamentals" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="popular" checked={form.popular} onChange={handleChange} className="w-4 h-4 accent-brand" />
          <label className="text-white text-sm">Mark as "Most Popular"</label>
        </div>

        <div className="pt-4 border-t border-line flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={18} /> {saving ? 'Saving...' : 'Save Course'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}