import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Landing from './pages/Landing'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Register from './pages/Register'
import Confirmation from './pages/Confirmation'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import StudentDashboard from './pages/StudentDashboard'
import StudentApplications from './pages/StudentApplications'
import StudentCourses from './pages/StudentCourses'
import StudentPayments from './pages/StudentPayments'
import StudentMessages from './pages/StudentMessages'
import StudentProfile from './pages/StudentProfile'
import StudentSettings from './pages/StudentSettings'
import AdminDashboard from './pages/AdminDashboard'
import AdminApplicationDetail from './pages/AdminApplicationDetail'
import AdminApplications from './pages/AdminApplications'
import AdminProfile from './pages/AdminProfile'
import AdminCourses from './pages/AdminCourses'
import AdminCourseForm from './pages/AdminCourseForm'
import AdminPayments from './pages/AdminPayments'
import AdminStudents from './pages/AdminStudents'
import AdminStudentDetail from './pages/AdminStudentDetail'
import WhatsAppButton from './components/WhatsAppButton'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* PROTECTED ROUTES (Must be logged in) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirmation/:ref" element={<Confirmation />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/dashboard/applications" element={<StudentApplications />} />
          <Route path="/dashboard/courses" element={<StudentCourses />} />
          <Route path="/dashboard/payments" element={<StudentPayments />} />
          <Route path="/dashboard/messages" element={<StudentMessages />} />
          <Route path="/dashboard/profile" element={<StudentProfile />} />
          <Route path="/dashboard/settings" element={<StudentSettings />} />
        </Route>
        
        {/* Admin Routes (Protected by AdminLayout role check) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/application/:id" element={<AdminApplicationDetail />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/courses/new" element={<AdminCourseForm />} />
        <Route path="/admin/courses/:id/edit" element={<AdminCourseForm />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/student/:id" element={<AdminStudentDetail />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {!isAdminRoute && <WhatsAppButton />}
    </>
  )
}