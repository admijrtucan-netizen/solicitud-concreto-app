export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  options,
  min,
  max,
  pattern,
  help,
  error,
}) {
  if (type === 'select') {
    return (
      <div className="form-group">
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={`form-select ${error ? 'border-red-500' : ''}`}
          required={required}
        >
          <option value="">-- Seleccionar --</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    )
  }

  if (type === 'checkbox') {
    return (
      <div className="form-group">
        <label className="flex items-center">
          <input
            type="checkbox"
            name={name}
            checked={value || false}
            onChange={onChange}
            disabled={disabled}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700">{label}</span>
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        {help && <p className="text-xs text-gray-500 mt-1 ml-6">{help}</p>}
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="form-group">
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`form-textarea ${error ? 'border-red-500' : ''}`}
          rows={4}
          required={required}
        />
        {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        pattern={pattern}
        className={`form-input ${error ? 'border-red-500' : ''}`}
        required={required}
      />
      {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
