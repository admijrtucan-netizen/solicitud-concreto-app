'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FormField from '@/components/FormField'
import SignaturePad from '@/components/SignaturePad'

export default function CampoSolicitud() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedFolio, setSelectedFolio] = useState('')
  const [folioData, setFolioData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    Cilindros: false,
    Vigas: false,
    Mortero: false,
    'Cantidad de Muestras (1 Muestra = 4 Moldes)': '',
    'Edad de ensayo': '',
    'Resistencia del Concreto, F\'C (kg/cm²)': '',
    'Tipo de Concreto': '',
    'Revenimiento del proyecto (cm)': '',
    'Tamaño Máximo del Agregado (mm)': '',
    'Tiempo de entrega de Resultados': '',
    'Persona que tomó los datos': '',
  })

  const [errors, setErrors] = useState({})
  const [signature, setSignature] = useState(null)
  const [folios, setFolios] = useState([])
  const [loadingFolios, setLoadingFolios] = useState(true)

  useEffect(() => {
    fetchFolios()
  }, [])

  const fetchFolios = async () => {
    try {
      const res = await fetch('/api/folio/all')
      if (res.ok) {
        const data = await res.json()
        setFolios(data.folios || [])
      }
    } catch (error) {
      console.error('Error fetching folios:', error)
      setFolios([])
    } finally {
      setLoadingFolios(false)
    }
  }

  const handleFolioSelect = async (folio) => {
    setSelectedFolio(folio)
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/solicitud/folio?folio=${folio}`)
      if (!res.ok) {
        console.log('Folio no encontrado en API')
        setFolioData(null)
      } else {
        const data = await res.json()
        console.log('Datos del folio:', data)
        setFolioData(data)
      }
      setStep(2)
    } catch (err) {
      console.error('Error fetching folio:', err)
      setFolioData(null)
      setStep(2)
    } finally {
      setLoading(false)
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

    if (!formData.Cilindros && !formData.Vigas && !formData.Mortero) {
      newErrors['tipo_muestra'] = 'Debe seleccionar al menos un tipo'
    }
    if (!formData['Cantidad de Muestras (1 Muestra = 4 Moldes)']) {
      newErrors['Cantidad de Muestras (1 Muestra = 4 Moldes)'] = 'Requerido'
    }
    if (!formData['Edad de ensayo']) {
      newErrors['Edad de ensayo'] = 'Requerido'
    }
    if (!formData['Resistencia del Concreto, F\'C (kg/cm²)']) {
      newErrors['Resistencia del Concreto, F\'C (kg/cm²)'] = 'Requerido'
    }
    if (!formData['Tipo de Concreto']) {
      newErrors['Tipo de Concreto'] = 'Requerido'
    }
    if (!formData['Revenimiento del proyecto (cm)']) {
      newErrors['Revenimiento del proyecto (cm)'] = 'Requerido'
    }
    if (!formData['Tamaño Máximo del Agregado (mm)']) {
      newErrors['Tamaño Máximo del Agregado (mm)'] = 'Requerido'
    }
    if (!formData['Tiempo de entrega de Resultados']) {
      newErrors['Tiempo de entrega de Resultados'] = 'Requerido'
    }
    if (!formData['Persona que tomó los datos']) {
      newErrors['Persona que tomó los datos'] = 'Requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignature = (imageData) => {
    setSignature(imageData)
  }

  const handleSave = async () => {
    if (!validateForm() || !signature) {
      setErrors(prev => ({ ...prev, firma: !signature ? 'Firma es requerida' : prev.firma }))
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Folio: selectedFolio,
          ...formData,
          'Firma': signature,
          ETAPA: 'LISTO',
        }),
      })

      if (res.ok) {
        alert('Informe de Campo guardado correctamente')
        router.push('/')
      } else {
        alert('Error al guardar')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // PASO 1: Seleccionar Folio
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold mb-2">
            SOLICITUD DE SERVICIO - CAMPO
          </h2>
          <p className="text-sm text-gray-600 mb-6">Paso 1: Seleccionar Folio</p>

          <div className="form-group">
            <label className="form-label">
              Seleccionar Folio
              <span className="text-red-600 ml-1">*</span>
            </label>
            {loadingFolios ? (
              <p className="text-sm text-gray-600">Cargando folios...</p>
            ) : folios.length === 0 ? (
              <p className="text-sm text-red-600">No hay folios disponibles. Por favor, crea una solicitud en OFICINA primero.</p>
            ) : (
              <select
                value={selectedFolio}
                onChange={(e) => setSelectedFolio(e.target.value)}
                className="form-select"
              >
                <option value="">-- Seleccionar un folio --</option>
                {folios.map(folio => (
                  <option key={folio} value={folio}>
                    {folio}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <Link href="/">
              <button type="button" className="btn btn-secondary">
                Cancelar
              </button>
            </Link>
            <button
              onClick={() => selectedFolio && handleFolioSelect(selectedFolio)}
              disabled={!selectedFolio || loading}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Continuar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // PASO 2: Confirmar datos y llenar informe
  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold mb-2">
            SOLICITUD DE SERVICIO - CAMPO
          </h2>
          <p className="text-sm text-gray-600 mb-6">Folio: {selectedFolio}</p>

          {/* PREVIA DE DATOS */}
          <div className="preview-section mb-8">
            <h3 className="font-semibold mb-4 text-gray-900">Datos de la Solicitud (OFICINA)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Fecha de Servicio</p>
                <p className="font-medium">{folioData?.['Fecha de Servicio']}</p>
              </div>
              <div>
                <p className="text-gray-500">Cliente (Empresa)</p>
                <p className="font-medium">{folioData?.['Nombre de la empresa']}</p>
              </div>
              <div>
                <p className="text-gray-500">Dirección de la Obra</p>
                <p className="font-medium">{folioData?.['Dirección de la obra']}</p>
              </div>
              <div>
                <p className="text-gray-500">Elemento a Colar</p>
                <p className="font-medium">{folioData?.['Elemento a colar']}</p>
              </div>
              <div>
                <p className="text-gray-500">Residente de Obra</p>
                <p className="font-medium">{folioData?.['Nombre Residente de obra']}</p>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="btn btn-secondary mt-4 text-sm"
            >
              Cambiar Folio
            </button>
          </div>

          {/* FORMULARIO DE CAMPO */}
          <form noValidate>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Tipo de Muestra</h3>

            {errors['tipo_muestra'] && (
              <p className="text-sm text-red-600 mb-4">{errors['tipo_muestra']}</p>
            )}

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

            <h3 className="text-lg font-semibold mb-4 text-gray-900">Datos de Muestras</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Cantidad de Muestras (1 Muestra = 4 Moldes)"
                name="Cantidad de Muestras (1 Muestra = 4 Moldes)"
                type="number"
                value={formData['Cantidad de Muestras (1 Muestra = 4 Moldes)']}
                onChange={handleChange}
                required
                error={errors['Cantidad de Muestras (1 Muestra = 4 Moldes)']}
              />
              <FormField
                label="Edad de Ensayo"
                name="Edad de ensayo"
                value={formData['Edad de ensayo']}
                onChange={handleChange}
                required
                error={errors['Edad de ensayo']}
                help="Ej: 5 dias, 7 dias"
              />
            </div>

            <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Propiedades del Concreto</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Resistencia del Concreto, F'C (kg/cm²)"
                name="Resistencia del Concreto, F'C (kg/cm²)"
                type="number"
                value={formData['Resistencia del Concreto, F\'C (kg/cm²)']}
                onChange={handleChange}
                required
                error={errors['Resistencia del Concreto, F\'C (kg/cm²)']}
              />
              <FormField
                label="Tipo de Concreto"
                name="Tipo de Concreto"
                type="select"
                value={formData['Tipo de Concreto']}
                onChange={handleChange}
                required
                error={errors['Tipo de Concreto']}
                options={[
                  { value: 'N', label: 'N' },
                  { value: 'RR', label: 'RR' },
                ]}
              />
              <FormField
                label="Revenimiento del Proyecto (cm)"
                name="Revenimiento del proyecto (cm)"
                type="number"
                value={formData['Revenimiento del proyecto (cm)']}
                onChange={handleChange}
                required
                error={errors['Revenimiento del proyecto (cm)']}
              />
              <FormField
                label="Tamaño Máximo del Agregado (mm)"
                name="Tamaño Máximo del Agregado (mm)"
                type="number"
                value={formData['Tamaño Máximo del Agregado (mm)']}
                onChange={handleChange}
                required
                error={errors['Tamaño Máximo del Agregado (mm)']}
              />
            </div>

            <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Información Adicional</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Tiempo de Entrega de Resultados"
                name="Tiempo de entrega de Resultados"
                type="number"
                value={formData['Tiempo de entrega de Resultados']}
                onChange={handleChange}
                required
                error={errors['Tiempo de entrega de Resultados']}
                help="Solo números (días)"
              />
              <FormField
                label="Persona que Tomó los Datos"
                name="Persona que tomó los datos"
                value={formData['Persona que tomó los datos']}
                onChange={handleChange}
                required
                error={errors['Persona que tomó los datos']}
              />
            </div>

            <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Firma Digital</h3>

            <SignaturePad onSignatureCapture={handleSignature} label="Firma de Campo" />
            {errors['firma'] && <p className="text-sm text-red-600 mb-4">{errors['firma']}</p>}
            {signature && <p className="text-sm text-green-600 mb-4">Firma capturada</p>}

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                Cambiar Folio
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Informe de Campo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}
