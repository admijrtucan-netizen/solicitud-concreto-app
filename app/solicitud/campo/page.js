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

  const CAMPOS_EDITABLES = [
    'Volumen a colar (m³)',
    'Cantidad de Muestras (1 Muestra = 4 Moldes)',
    'Edad de ensayo',
    'Resistencia del Concreto, F\'C (kg/cm²)',
    'Tipo de Concreto',
    'Revenimiento del proyecto (cm)',
    'Tamaño Máximo del Agregado (mm)',
    'Tiempo de entrega de Resultados',
  ]

  const [formData, setFormData] = useState({})
  const [initialData, setInitialData] = useState({})
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
        console.log('Folio no encontrado')
        setFolioData(null)
        setFormData({})
        setInitialData({})
      } else {
        const data = await res.json()
        console.log('Datos del folio:', data)
        setFolioData(data)

        const precargados = {}
        CAMPOS_EDITABLES.forEach(campo => {
          precargados[campo] = data[campo] || ''
        })
        setFormData(precargados)
        setInitialData(precargados)
      }
      setStep(2)
    } catch (err) {
      console.error('Error:', err)
      setFolioData(null)
      setFormData({})
      setInitialData({})
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const detectarCambios = () => {
    return CAMPOS_EDITABLES.filter(campo =>
      formData[campo] !== initialData[campo]
    )
  }

  const cambios = detectarCambios()

  const handleSave = async () => {
    if (!signature) {
      setErrors(prev => ({ ...prev, firma: 'Firma es requerida' }))
      return
    }

    setLoading(true)
    try {
      const datosGuardar = {
        Folio: selectedFolio,
        ...formData,
        'Persona que tomó los datos': folioData?.['Persona que tomó los datos'] || '',
        'Firma': signature,
      }

      if (cambios.length > 0) {
        datosGuardar['Cambios'] = 'PENDIENTE NUEVA FIRMA'
        datosGuardar['ETAPA'] = 'EN PROCESO'
      } else {
        datosGuardar['ETAPA'] = 'LISTO'
      }

      const res = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosGuardar),
      })

      if (res.ok) {
        alert('Solicitud de Campo guardada correctamente')
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
          <h2 className="text-2xl font-bold mb-2">SOLICITUD DE SERVICIO - CAMPO</h2>
          <p className="text-sm text-gray-600 mb-6">Paso 1: Seleccionar Folio</p>

          <div className="form-group">
            <label className="form-label">Seleccionar Folio *</label>
            {loadingFolios ? (
              <p className="text-sm text-gray-600">Cargando folios...</p>
            ) : folios.length === 0 ? (
              <p className="text-sm text-red-600">No hay folios. Crea una solicitud en OFICINA primero.</p>
            ) : (
              <select
                value={selectedFolio}
                onChange={(e) => setSelectedFolio(e.target.value)}
                className="form-select"
              >
                <option value="">-- Seleccionar --</option>
                {folios.map(folio => (
                  <option key={folio} value={folio}>{folio}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <Link href="/"><button type="button" className="btn btn-secondary">Cancelar</button></Link>
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

  // PASO 2: Editar campos y firmar
  if (step === 2) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold mb-2">SOLICITUD DE SERVICIO - CAMPO</h2>
          <p className="text-sm text-gray-600 mb-6">Folio: {selectedFolio}</p>

          {cambios.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded mb-6 text-yellow-800 text-sm">
              <strong>Cambios detectados:</strong> {cambios.join(', ')} - Marca como PENDIENTE NUEVA FIRMA
            </div>
          )}

          {/* DATOS DE OFICINA - READ ONLY */}
          <div className="bg-gray-50 p-4 rounded mb-8 border-l-4" style={{ borderLeftColor: '#9ca3af' }}>
            <h3 className="font-semibold mb-4 text-gray-900">Datos de la Solicitud (OFICINA - Solo Lectura)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {folioData && (
                <>
                  <FormField label="Fecha Solicitud" value={folioData['Fecha de Solicitud']} disabled />
                  <FormField label="Folio" value={selectedFolio} disabled />
                  <FormField label="Empresa" value={folioData['Nombre de la empresa']} disabled />
                  <FormField label="Teléfono" value={folioData['Tel de la empresa']} disabled />
                  <FormField label="Email" value={folioData['Email de la empresa']} disabled />
                  <FormField label="RFC" value={folioData['RFC de la empresa']} disabled />
                  <FormField label="Contacto" value={folioData['Nombre del Contacto']} disabled />
                  <FormField label="Cel Contacto" value={folioData['Cel del Contacto']} disabled />
                  <FormField label="Obra" value={folioData['Nombre de la Obra']} disabled />
                  <FormField label="Dirección Obra" value={folioData['Dirección de la obra']} disabled />
                  <FormField label="Residente" value={folioData['Nombre Residente de obra']} disabled />
                  <FormField label="Cel Residente" value={folioData['Cel Residente de obra']} disabled />
                  <FormField label="Elemento a Colar" value={folioData['Elemento a colar']} disabled />
                  <FormField label="Planta" value={folioData['Planta de premezclado']} disabled />
                </>
              )}
            </div>
          </div>

          {/* CAMPOS EDITABLES */}
          <form noValidate>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Campos Editables (Puede cambiar si es necesario)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Volumen a Colar (m³)"
                name="Volumen a colar (m³)"
                type="number"
                value={formData['Volumen a colar (m³)'] || ''}
                onChange={handleChange}
              />
              <FormField
                label="Cantidad de Muestras"
                name="Cantidad de Muestras (1 Muestra = 4 Moldes)"
                type="number"
                value={formData['Cantidad de Muestras (1 Muestra = 4 Moldes)'] || ''}
                onChange={handleChange}
              />
              <FormField
                label="Edad de Ensayo"
                name="Edad de ensayo"
                value={formData['Edad de ensayo'] || ''}
                onChange={handleChange}
              />
              <FormField
                label="Resistencia F'C (kg/cm²)"
                name="Resistencia del Concreto, F\'C (kg/cm²)"
                type="number"
                value={formData['Resistencia del Concreto, F\'C (kg/cm²)'] || ''}
                onChange={handleChange}
              />
              <FormField
                label="Tipo de Concreto"
                name="Tipo de Concreto"
                type="select"
                value={formData['Tipo de Concreto'] || ''}
                onChange={handleChange}
                options={[
                  { value: 'N', label: 'N' },
                  { value: 'RR', label: 'RR' },
                ]}
              />
              <FormField
                label="Revenimiento (cm)"
                name="Revenimiento del proyecto (cm)"
                type="number"
                value={formData['Revenimiento del proyecto (cm)'] || ''}
                onChange={handleChange}
              />
              <FormField
                label="TMA (mm)"
                name="Tamaño Máximo del Agregado (mm)"
                type="number"
                value={formData['Tamaño Máximo del Agregado (mm)'] || ''}
                onChange={handleChange}
              />
              <FormField
                label="Tiempo Entrega Resultados (días)"
                name="Tiempo de entrega de Resultados"
                type="number"
                value={formData['Tiempo de entrega de Resultados'] || ''}
                onChange={handleChange}
              />
            </div>

            <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-900">Firma de Campo</h3>
            <SignaturePad onSignatureCapture={(sig) => setSignature(sig)} label="Firma (OBLIGATORIA)" />
            {errors['firma'] && <p className="text-sm text-red-600 mb-4">{errors['firma']}</p>}
            {signature && <p className="text-sm text-green-600 mb-4">Firma capturada</p>}

            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                Cambiar Folio
              </button>
              <button type="button" onClick={handleSave} disabled={loading} className="btn btn-primary disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar Solicitud de Campo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
}
