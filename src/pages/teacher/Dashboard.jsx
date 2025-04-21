import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import AddStudentModal from './components/AddStudentModal'
import StatsCard from './components/StatsCard'
import DateRangeFilter from './components/DateRangeFilter'

export default function Dashboard() {
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [students, setStudents] = useState([])

  
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalEarnings: 0,
    pendingTotal: 0,
    pendingPayments: 0
  })
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

  useEffect(() => {
    fetchStats()
    fetchStudents()
  }, [dateRange])

  const fetchStats = async () => {
    try {
      const params = {}
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate
        params.endDate = dateRange.endDate
      }
      const { data } = await axios.get('/api/stats', { params })
      setStats(data.data.stats)
    } catch (error) {
      toast.error('İstatistikler alınırken bir hata oluştu')
    }
  }

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/api/users/students')
      const studentsWithStats = await Promise.all(
        data.data.students.map(async (student) => {
          const params = {}          
          if (dateRange.startDate && dateRange.endDate) {
            params.startDate = dateRange.startDate
            params.endDate = dateRange.endDate
          }
          
          const statsResponse = await axios.get('/api/stats/student', {
            params: {
              id: student._id,
              ...params
            }
          })
          return { ...student, stats: statsResponse.data.data.stats }
        })
      )
      setStudents(studentsWithStats)
    } catch (error) {
      console.log(error);
      toast.error('Öğrenci listesi alınırken bir hata oluştu')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <button
            onClick={() => setShowAddStudent(true)}
            className="btn btn-primary"
          >
            Öğrenci Ekle
          </button>
        </div>

        <DateRangeFilter
          dateRange={dateRange}
          onChange={setDateRange}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Toplam Öğrenci"
            value={students.length}
            type="students"
          />
          <StatsCard
            title="Toplam Ders"
            value={stats.totalLessons}
            type="lessons"
          />
          <StatsCard
            title="Toplam Kazanç"
            value={`₺${stats.totalEarnings}`}
            type="earnings"
          />
          <StatsCard
            title="Bekleyen Ödeme"
            value={`₺${stats.pendingTotal}`}
            type="pending"
          />
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Öğrenci Listesi</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Öğrenci
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toplam Ders
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toplam Ödeme
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kalan Ödeme
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/student/${student._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {student.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.stats?.totalLessons || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₺{student.stats?.totalEarnings || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₺{student.stats?.pendingTotal || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AddStudentModal
        open={showAddStudent}
        onClose={() => setShowAddStudent(false)}
        onSuccess={() => {
          setShowAddStudent(false)
          fetchStudents()
          fetchStats()
          toast.success('Öğrenci başarıyla eklendi')
        }}
      />
    </Layout>
  )
}