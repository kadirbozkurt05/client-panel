import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout'
import StatsCard from './components/StatsCard'
import DateRangeFilter from './components/DateRangeFilter'
import AddLessonModal from './components/AddLessonModal'
import EditLessonModal from './components/EditLessonModal'
import DeleteConfirmationModal from './components/DeleteConfirmationModal'

export default function StudentDetailsOriginal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalEarnings: 0,
    pendingTotal: 0
  })
  const [lessons, setLessons] = useState([])
  const [futureLessons, setFutureLessons] = useState([])
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [showEditLesson, setShowEditLesson] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [showDeleteStudentConfirmation, setShowDeleteStudentConfirmation] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [paymentFilter, setPaymentFilter] = useState('')

  useEffect(() => {
    fetchStudentData()
    fetchLessons()
    fetchFutureLessons()
  }, [id, dateRange, currentPage, paymentFilter])

  const fetchStudentData = async () => {
    try {    
      const { data } = await axios.get('/api/users/students', {
        params: {
          id
        }
      })
      setStudent(data.data.student)
    } catch (error) {
      toast.error('Öğrenci bilgileri alınamadı');
      navigate('/')
    }
  }
  const fetchStats = async () => {
    try {
      const params = {}
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate
        params.endDate = dateRange.endDate
      }
      if(student) {
        const { data } = await axios.get('/api/stats/student', {
          params: {
            id: student?._id,
            ...params
          }
        });
      setStats(data.data.stats)

      }

    } catch (error) {
      toast.error('İstatistikler alınamadı')
    }
  }

  useEffect(() => {
    fetchStats();
  },[student])



  const fetchLessons = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 5,
      };
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }
      if (paymentFilter) {
        params.odeme_durumu = paymentFilter;
      }
      const { data } = await axios.get(`/api/lessons/student/${id}`, { params });
      const pastLessons = data.data.lessons.filter(
        (lesson) => new Date(lesson.tarih) <= new Date()
      );
      setLessons(pastLessons);
      setTotalPages(Math.ceil(pastLessons.length / 5)); // Approximate, may be inaccurate
    } catch (error) {
      console.log('Fetch lessons error:', error.response?.data);
      toast.error('Dersler alınamadı');
    }
  };

  const fetchFutureLessons = async () => {
    try {
      const { data } = await axios.get(`/api/lessons/student/${id}`, {
        params: { isFuture: true }
      })
      setFutureLessons(data.data.lessons)
    } catch (error) {
      toast.error('Gelecek dersler alınamadı')
    }
  }

  const handleDeleteLesson = async () => {
    try {
      await axios.delete(`/api/lessons/${selectedLesson._id}`)
      setShowDeleteConfirmation(false)
      setSelectedLesson(null)
      fetchLessons()
      fetchFutureLessons()
      toast.success('Ders başarıyla silindi')
    } catch (error) {
      toast.error('Ders silinirken bir hata oluştu')
    }
  }

  const handleDeleteStudent = async () => {
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('Öğrenci başarıyla silindi');
      navigate('/');
    } catch (error) {
      console.log('Delete student error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Öğrenci silinirken bir hata oluştu');
    }
  };

  if (!student) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
          <button
            onClick={() => setShowAddLesson(true)}
            className="btn btn-primary"
          >
            Ders Ekle
          </button>
        </div>

        <DateRangeFilter
          dateRange={dateRange}
          onChange={setDateRange}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Geçmiş Dersler</h2>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="input w-auto"
              >
                <option value="">Tüm Ödemeler</option>
                <option value="ödendi">Ödendi</option>
                <option value="ödenmedi">Ödenmedi</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saat
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ücret
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme Durumu
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lessons.map((lesson) => (
                    <tr key={lesson._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(lesson.tarih), 'dd.MM.yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lesson.saat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₺{lesson.ucret}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lesson.odeme_durumu === 'ödendi'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {lesson.odeme_durumu}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setShowEditLesson(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setShowDeleteConfirmation(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Gelecek Dersler</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saat
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ücret
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {futureLessons.map((lesson) => (
                    <tr key={lesson._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(lesson.tarih), 'dd.MM.yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lesson.saat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₺{lesson.ucret}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setShowEditLesson(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson)
                            setShowDeleteConfirmation(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setShowDeleteStudentConfirmation(true)}
            className="btn btn-danger"
          >
            Öğrenciyi Sil
          </button>
        </div>
      </div>

      <AddLessonModal
        open={showAddLesson}
        onClose={() => setShowAddLesson(false)}
        studentId={id}
        onSuccess={() => {
          setShowAddLesson(false)
          fetchLessons()
          fetchStats()
          fetchFutureLessons()
          toast.success('Ders başarıyla eklendi')
        }}
      />

      {selectedLesson && (
        <EditLessonModal
          open={showEditLesson}
          onClose={() => {
            setShowEditLesson(false)
            setSelectedLesson(null)
          }}
          lesson={selectedLesson}
          onSuccess={() => {
            setShowEditLesson(false)
            setSelectedLesson(null)
            fetchLessons()
            fetchStats()
            fetchFutureLessons()
            toast.success('Ders başarıyla güncellendi')
          }}
        />
      )}

      <DeleteConfirmationModal
        open={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false)
          setSelectedLesson(null)
        }}
        onConfirm={handleDeleteLesson}
        title="Dersi Sil"
        message="Bu dersi silmek istediğinizden emin misiniz?"
      />

      <DeleteConfirmationModal
        open={showDeleteStudentConfirmation}
        onClose={() => setShowDeleteStudentConfirmation(false)}
        onConfirm={handleDeleteStudent}
        title="Öğrenciyi Sil"
        message="Bu öğrenciyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
      />
    </Layout>
  )
}

