export default function DateRangeFilter({ dateRange, onChange }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex sm:items-center">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 sm:mr-4">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            className="input mt-1 sm:mt-0 sm:w-auto"
            value={dateRange.startDate}
            onChange={(e) => onChange({ ...dateRange, startDate: e.target.value })}
          />
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:items-center">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 sm:mr-4">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            className="input mt-1 sm:mt-0 sm:w-auto"
            value={dateRange.endDate}
            onChange={(e) => onChange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}