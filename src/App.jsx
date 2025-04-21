import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import TeacherDashboard from './pages/teacher/Dashboard'
import StudentDashboard from './pages/student/Dashboard'
import StudentDetails from './pages/teacher/StudentDetails'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        !user ? <Login /> : <Navigate to="/" replace />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          {user?.role === 'öğretmen' ? <TeacherDashboard /> : <StudentDashboard />}
        </ProtectedRoute>
      } />
      
      <Route path="/student/:id" element={
        <ProtectedRoute allowedRoles={['öğretmen']}>
          <StudentDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App