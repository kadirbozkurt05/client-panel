import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddLessonModal = ({ open, onClose, studentId, onSuccess }) => {
  const [formData, setFormData] = useState({
    tarih: '',
    saat: '',
    ucret: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token'); // Adjust based on your auth setup
      await axios.post(
        import.meta.env.VITE_API_URL+'/api/lessons',
        {
          ogrenci_id: studentId,
          tarih: new Date(formData.tarih).toISOString(),
          saat: formData.saat,
          ucret: parseFloat(formData.ucret),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onSuccess(); // Calls setShowAddLesson(false), fetchLessons(), fetchFutureLessons(), and toast
    } catch (error) {
      console.log('Add lesson error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Ders eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Ders Ekle</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="tarih" className="block text-sm font-medium text-gray-700">
              Ders Tarihi
            </label>
            <input
              type="date"
              id="tarih"
              name="tarih"
              value={formData.tarih}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="saat" className="block text-sm font-medium text-gray-700">
              Ders Saati
            </label>
            <input
              type="time"
              id="saat"
              name="saat"
              value={formData.saat}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="ucret" className="block text-sm font-medium text-gray-700">
              Ücret (TL)
            </label>
            <input
              type="number"
              id="ucret"
              name="ucret"
              value={formData.ucret}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Ekleniyor...' : 'Ders Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLessonModal;