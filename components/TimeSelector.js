export default function TimeSelector({ label, name, value, onChange, required = false, error }) {
  const parseTime = (timeStr) => {
    if (!timeStr) return { hours: '', minutes: '' }
    const [h, m] = timeStr.split(':')
    return { hours: h || '', minutes: m || '' }
  }

  const { hours, minutes } = parseTime(value)

  const handleHourChange = (e) => {
    const h = e.target.value
    const m = minutes || '00'
    const newTime = h ? `${h.padStart(2, '0')}:${m.padStart(2, '0')}` : ''
    onChange({ target: { name, value: newTime } })
  }

  const handleMinuteChange = (e) => {
    const m = e.target.value
    const h = hours || '00'
    const newTime = h ? `${h.padStart(2, '0')}:${m.padStart(2, '0')}` : ''
    onChange({ target: { name, value: newTime } })
  }

  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <div className="flex gap-2 items-center">
        <select
          value={hours}
          onChange={handleHourChange}
          className={`form-select ${error ? 'border-red-500' : ''}`}
          style={{ flex: 1 }}
        >
          <option value="">-- Hora --</option>
          {hourOptions.map(h => (
            <option key={h} value={String(h).padStart(2, '0')}>
              {String(h).padStart(2, '0')}
            </option>
          ))}
        </select>
        <span className="text-gray-700 font-bold">:</span>
        <select
          value={minutes}
          onChange={handleMinuteChange}
          className={`form-select ${error ? 'border-red-500' : ''}`}
          style={{ flex: 1 }}
        >
          <option value="">-- Min --</option>
          {minuteOptions.map(m => (
            <option key={m} value={String(m).padStart(2, '0')}>
              {String(m).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
