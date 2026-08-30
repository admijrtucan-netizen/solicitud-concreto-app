'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FormField from '@/components/FormField'
import TimeSelector from '@/components/TimeSelector'
import ClienteSelector from '../../components/ClienteSelector'

export default function OficinaSolicitud() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    'Fecha de Solicitud': '',
    'Fecha de Servicio': '',
    Folio: '',
    'Hora de servicio': '',
    'Nombre de la empresa': '',
    'Tel de la empresa': '',
    'Email de la empresa': '',
    'RFC de la empresa': '',
    'Nombre del Contacto': '',
    'Cel del Contacto': '',
    'Nombre de la Obra': '',
    'Dirección de la obra': '',
    'Nombre Residente de obra': '',
    'Cel Residente de obra': '',
    'Elemento a colar': '',
    'Volumen a colar (m³)': '',
    'Planta de premezclado': '',
    'Cilindros': false,
    'Vigas': false,
    'Mortero': false,
    'Cantidad de Muestras (1 Muestra = 4 Moldes)': '',
    'Edad de ensayo': '',
    'Resistencia del Concreto, F\'C (kg/cm²)': '',
    'Tipo de Concreto': '',
    'Revenimiento del proyecto (cm)': '',
    'Tamaño Máximo del Agregado (mm)': '',
    'Tiempo de entrega de Resultados': '',
    '¿La empresa realiza el servicio solicitado?': false,
    '¿La prueba solicitada está acreditada?': false,
    '¿Tenemos disponibilidad de personal y equipo para realizar el servicio solicitado en la fecha establecida?': false,
    '¿Se requiere enviar equipo de laboratorio a la obra para realizar pruebas?': false,
    '¿Se acepta realizar el Servicio Solicitado?': false,
  })

  const [nextFolio, setNextFolio] = useState('INN-00001')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [folioExists, setFolioExists] = useState(false)
  const [checkingFolio, setCheckingFolio] = useState(false)

  useEffect(() => {
    fetchNextFolio()
  }, [])

  const fetchNextFolio = async () => {
    try {
      const res = await fetch('/api/folio/next')
      const data = await res.json()
      setNextFolio(`INN-${String(data.nextNumber).padStart(5, '0')}`)
    } catch (error) {
      console.error('Error fetching next folio:', error)
    }
  }

  const validateFolio = async (folio) => {
    if (!folio) {
      setFolioExists(false)
      return
    }

    setCheckingFolio(true)
    try {
      const res = await fetch('/api/folio/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folio }),
      })
      const data = await res.json()
      setFolioExists(data.exists)
    } catch (error) {
      console.error('Error validating folio:', error)
    } finally {
      setCheckingFolio(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (folioExists) {
      newErrors['Folio'] = 'Este folio ya ha sido utilizado'
    }
    if (!formData['Fecha de Solicitud']) newErrors['Fecha de Solicitud'] = 'Requerido'
    if (!formData['Fecha de Servicio']) newErrors['Fecha de Servicio'] = 'Requerido'
    if (!formData['Folio']) newErrors['Folio'] = 'Requerido'
    if (!formData['Hora de servicio']) newErrors['Hora de servicio'] = 'Requerido'
    if (!formData['Nombre de la empresa']) newErrors['Nombre de la empresa'] = 'Requerido'
    if (!formData['Tel de la empresa']) newErrors['Tel de la empresa'] = 'Requerido'
    if (!formData['Nombre del Contacto']) newErrors['Nombre del Contacto'] = 'Requerido'
    if (!formData['Cel del Contacto']) newErrors['Cel del Contacto'] = 'Requerido'
    if (!formData['Nombre de la Obra']) newErrors['Nombre de la Obra'] = 'Requerido'
    if (!formData['Dirección de la obra']) newErrors['Dirección de la obra'] = 'Requerido'
    if (!formData['Elemento a colar']) newErrors['Elemento a colar'] = 'Requerido'
    if (!formData['Volumen a colar (m³)']) newErrors['Volumen a colar (m³)'] = 'Requerido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const res = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ETAPA: 'EN PROCESO',
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Solicitud guardada. Folio: ${formData.Folio}`)
        router.push('/')
      } else {
        const errorMsg = data.error || 'Error al guardar'
        console.error('API Error:', errorMsg)
        alert(`Error: ${errorMsg}`)
      }
    } catch (error) {
      console.error('Fetch Error:', error)
      alert(`Error de conexión: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">
          SOLICITUD DE SERVICIO DE CONCRETO - OFICINA
        </h2>
        <p className="text-sm text-gray-600 mb-6">Llenar datos de cliente y obra</p>

        <form noValidate>
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Información General</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Fecha de Solicitud"
              name="Fecha de Solicitud"
              type="date"
              value={formData['Fecha de Solicitud']}
              onChange={handleChange}
              required
              error={errors['Fecha de Solicitud']}
            />
            <FormField
              label="Fecha de Servicio"
              name="Fecha de Servicio"
              type="date"
              value={formData['Fecha de Servicio']}
              onChange={handleChange}
              required
              error={errors['Fecha de Servicio']}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                Folio
                <span className="text-red-600 ml-1">*</span>
              </label>
              <div className="flex gap-2 items-center">
                <div className="flex items-center flex-1 border border-gray-300 rounded-md overflow-hidden">
                  <span className="bg-gray-100 px-3 py-2 font-medium text-gray-700">INN-</span>
                  <input
                    type="text"
                    name="Folio"
                    value={formData.Folio ? formData.Folio.replace('INN-', '') : ''}
                    onChange={(e) => {
                      const numbers = e.target.value.replace(/\D/g, '')
                      const fullFolio = numbers ? `INN-${numbers}` : ''
                      setFormData(prev => ({
                        ...prev,
                        Folio: fullFolio,
                      }))
                      if (fullFolio) {
                        validateFolio(fullFolio)
                      } else {
                        setFolioExists(false)
                      }
                      if (errors['Folio']) {
                        setErrors(prev => ({ ...prev, Folio: null }))
                      }
                    }}
                    className="form-input flex-1 border-0 focus:ring-0 focus:outline-none"
                    placeholder="00001"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, Folio: nextFolio }))}
                  className="btn btn-secondary text-sm"
                >
                  Usar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Solo números (ej: 34565)</p>
              {folioExists && (
                <div className="p-3 bg-red-100 border border-red-400 rounded mt-2 text-sm text-red-800">
                  <strong>Advertencia:</strong> El folio {formData.Folio} ya ha sido utilizado. Por favor ingresa un folio diferente.
                </div>
              )}
              {errors['Folio'] && <p className="text-xs text-red-600 mt-1">{errors['Folio']}</p>}
            </div>

            <TimeSelector
              label="Hora de Servicio"
              name="Hora de servicio"
              value={formData['Hora de servicio']}
              onChange={handleChange}
              required
              error={errors['Hora de servicio']}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Datos de la Empresa</h3>

          <div className="grid grid-cols-1 gap-4">
            <ClienteSelector
              value={formData['Nombre de la empresa']}
              onChange={handleChange}
              onClienteSelect={(cliente) => {
                setFormData(prev => ({
                  ...prev,
                  'Nombre de la empresa': cliente.nombre,
                  'Tel de la empresa': cliente.telefono || prev['Tel de la empresa'],
                  'Email de la empresa': cliente.email || prev['Email de la empresa'],
                  'RFC de la empresa': cliente.rfc || prev['RFC de la empresa'],
                  'Nombre del Contacto': cliente.contacto || prev['Nombre del Contacto'],
                }))
              }}
            />
            {errors['Nombre de la empresa'] && (
              <p className="text-xs text-red-600">{errors['Nombre de la empresa']}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              label="Telefono"
              name="Tel de la empresa"
              type="tel"
              value={formData['Tel de la empresa']}
              onChange={handleChange}
              required
              error={errors['Tel de la empresa']}
            />
            <FormField
              label="Email"
              name="Email de la empresa"
              type="email"
              value={formData['Email de la empresa']}
              onChange={handleChange}
            />
            <FormField
              label="RFC"
              name="RFC de la empresa"
              value={formData['RFC de la empresa']}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Contacto</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nombre del Contacto"
              name="Nombre del Contacto"
              value={formData['Nombre del Contacto']}
              onChange={handleChange}
              required
              error={errors['Nombre del Contacto']}
            />
            <FormField
              label="Celular del Contacto"
              name="Cel del Contacto"
              type="tel"
              value={formData['Cel del Contacto']}
              onChange={handleChange}
              required
              error={errors['Cel del Contacto']}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Datos de la Obra</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nombre de la Obra"
              name="Nombre de la Obra"
              value={formData['Nombre de la Obra']}
              onChange={handleChange}
              required
              error={errors['Nombre de la Obra']}
            />
            <FormField
              label="Dirección de la Obra"
              name="Dirección de la obra"
              value={formData['Dirección de la obra']}
              onChange={handleChange}
              required
              error={errors['Dirección de la obra']}
            />
            <FormField
              label="Nombre del Residente de Obra"
              name="Nombre Residente de obra"
              value={formData['Nombre Residente de obra']}
              onChange={handleChange}
              required
            />
            <FormField
              label="Celular del Residente"
              name="Cel Residente de obra"
              type="tel"
              value={formData['Cel Residente de obra']}
              onChange={handleChange}
              required
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Detalles Técnicos</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Elemento a Colar"
              name="Elemento a colar"
              value={formData['Elemento a colar']}
              onChange={handleChange}
              required
              error={errors['Elemento a colar']}
            />
            <FormField
              label="Volumen a Colar (m³)"
              name="Volumen a colar (m³)"
              type="number"
              value={formData['Volumen a colar (m³)']}
              onChange={handleChange}
              required
              error={errors['Volumen a colar (m³)']}
            />
            <FormField
              label="Planta de Premezclado"
              name="Planta de premezclado"
              value={formData['Planta de premezclado']}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Tipo de Muestra</h3>

          <div className="space-y-3 mb-8">
            <FormField
              label="Cilindros"
              name="Cilindros"
              type="checkbox"
              value={formData.Cilindros}
              onChange={handleChange}
            />
            <FormField
              label="Vigas"
              name="Vigas"
              type="checkbox"
              value={formData.Vigas}
              onChange={handleChange}
            />
            <FormField
              label="Mortero"
              name="Mortero"
              type="checkbox"
              value={formData.Mortero}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Propiedades del Concreto</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Cantidad de Muestras (1 Muestra = 4 Moldes)"
              name="Cantidad de Muestras (1 Muestra = 4 Moldes)"
              type="number"
              value={formData['Cantidad de Muestras (1 Muestra = 4 Moldes)']}
              onChange={handleChange}
            />
            <FormField
              label="Edad de Ensayo"
              name="Edad de ensayo"
              value={formData['Edad de ensayo']}
              onChange={handleChange}
              help="Ej: 5 dias, 7 dias"
            />
            <FormField
              label="Resistencia F'C (kg/cm²)"
              name="Resistencia del Concreto, F\'C (kg/cm²)"
              type="number"
              value={formData['Resistencia del Concreto, F\'C (kg/cm²)']}
              onChange={handleChange}
            />
            <FormField
              label="Tipo de Concreto"
              name="Tipo de Concreto"
              type="select"
              value={formData['Tipo de Concreto']}
              onChange={handleChange}
              options={[
                { value: '', label: '-- Seleccionar --' },
                { value: 'N', label: 'N' },
                { value: 'RR', label: 'RR' },
              ]}
            />
            <FormField
              label="Revenimiento (cm)"
              name="Revenimiento del proyecto (cm)"
              type="number"
              value={formData['Revenimiento del proyecto (cm)']}
              onChange={handleChange}
            />
            <FormField
              label="Tamaño Máximo Agregado (mm)"
              name="Tamaño Máximo del Agregado (mm)"
              type="number"
              value={formData['Tamaño Máximo del Agregado (mm)']}
              onChange={handleChange}
            />
            <FormField
              label="Tiempo de Entrega Resultados (días)"
              name="Tiempo de entrega de Resultados"
              type="number"
              value={formData['Tiempo de entrega de Resultados']}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Validación de Servicio</h3>

          <div className="space-y-3">
            <FormField
              label="¿La empresa realiza el servicio solicitado?"
              name="¿La empresa realiza el servicio solicitado?"
              type="checkbox"
              value={formData['¿La empresa realiza el servicio solicitado?']}
              onChange={handleChange}
              required
            />
            <FormField
              label="¿La prueba solicitada está acreditada?"
              name="¿La prueba solicitada está acreditada?"
              type="checkbox"
              value={formData['¿La prueba solicitada está acreditada?']}
              onChange={handleChange}
              required
            />
            <FormField
              label="¿Tenemos disponibilidad de personal y equipo para realizar el servicio en la fecha establecida?"
              name="¿Tenemos disponibilidad de personal y equipo para realizar el servicio solicitado en la fecha establecida?"
              type="checkbox"
              value={formData['¿Tenemos disponibilidad de personal y equipo para realizar el servicio solicitado en la fecha establecida?']}
              onChange={handleChange}
              required
            />
            <FormField
              label="¿Se requiere enviar equipo de laboratorio a la obra?"
              name="¿Se requiere enviar equipo de laboratorio a la obra para realizar pruebas?"
              type="checkbox"
              value={formData['¿Se requiere enviar equipo de laboratorio a la obra para realizar pruebas?']}
              onChange={handleChange}
              required
            />
            <FormField
              label="¿Se acepta realizar el Servicio Solicitado?"
              name="¿Se acepta realizar el Servicio Solicitado?"
              type="checkbox"
              value={formData['¿Se acepta realizar el Servicio Solicitado?']}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-4 mt-8">
            <Link href="/">
              <button type="button" className="btn btn-secondary">
                ← Cancelar
              </button>
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar y Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
