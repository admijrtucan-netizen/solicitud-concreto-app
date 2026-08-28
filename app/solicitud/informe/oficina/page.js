'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FormField from '@/components/FormField'
import TimeSelector from '@/components/TimeSelector'

export default function InformeOficina() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedFolio, setSelectedFolio] = useState('')
  const [folios, setFolios] = useState([])
  const [loadingFolios, setLoadingFolios] = useState(true)

  const [formData, setFormData] = useState({
    'No. de Reporte': '',
    'Cant. de Muestras Completas': 1,
    'No. De Cilindros': '',
    'No. de Vigas': '',
    'Otro': '',
    'Llegada personal': '',
    'Salida personal': '',
    'Método de curado': '',
    'Empresa': '',
    'Obra': '',
    'Resp. de Obra': '',
    'Fecha': '',
    'Tipo de muestreo': '',
    'Muestreo comp/indv': '',
    'Tipo de concreto': '',
    'Ubicación': '',
    'Elemento': '',
    'Proveedor de concreto': '',
  })

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
    } finally {
      setLoadingFolios(false)
    }
  }

  const handleFolioSelect = async (folio) => {
    setSelectedFolio(folio)
    setLoading(true)
    try {
      const res = await fetch(`/api/solicitud/folio?folio=${folio}`)
      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({
          ...prev,
          'Empresa': data['Nombre de la empresa'] || '',
          'Obra': data['Nombre de la Obra'] || '',
          'Resp. de Obra': data['Nombre Residente de obra'] || '',
          'Elemento': data['Elemento a colar'] || '',
          'Fecha': data['Fecha de Servicio'] || '',
        }))
      }
      setStep(2)
    } catch (error) {
      console.error('Error:', error)
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
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          'FOLIO TUCAN': selectedFolio, // Folio del informe
          muestras: {}, // Indica que es INFORME
          ETAPA: 'LISTO',
        }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('Datos de OFICINA guardados.')
        router.push('/')
      } else {
        alert('Error: ' + (data.error || 'Error al guardar'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold mb-2">INFORME DE CAMPO - OFICINA</h2>
          <p className="text-sm text-gray-600 mb-6">Seleccionar solicitud</p>

          <div className="form-group">
            <label className="form-label">Seleccionar Folio</label>
            {loadingFolios ? (
              <p className="text-sm text-gray-600">Cargando...</p>
            ) : (
              <select
                value={selectedFolio}
                onChange={(e) => setSelectedFolio(e.target.value)}
                className="form-select"
              >
                <option value="">-- Seleccionar un folio --</option>
                {folios.map(folio => (
                  <option key={folio} value={folio}>{folio}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <Link href="/solicitud/informe">
              <button type="button" className="btn btn-secondary">Volver</button>
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">INFORME DE CAMPO - OFICINA</h2>
        <p className="text-sm text-gray-600 mb-6">Folio: {selectedFolio}</p>

        <form noValidate>
          <h3 className="text-lg font-semibold mb-4">Información (pre-llenada de SOLICITUD)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Empresa" name="Empresa" value={formData['Empresa']} onChange={handleChange} />
            <FormField label="Obra" name="Obra" value={formData['Obra']} onChange={handleChange} />
            <FormField label="Resp. de Obra" name="Resp. de Obra" value={formData['Resp. de Obra']} onChange={handleChange} />
            <FormField label="Elemento" name="Elemento" value={formData['Elemento']} onChange={handleChange} />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8">Datos Adicionales</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="No. de Reporte" name="No. de Reporte" value={formData['No. de Reporte']} onChange={handleChange} />
            <FormField label="Cant. de Muestras" name="Cant. de Muestras Completas" type="number" value={formData['Cant. de Muestras Completas']} onChange={handleChange} />
          </div>

          <div className="flex gap-4 mt-8">
            <Link href="/solicitud/informe">
              <button type="button" className="btn btn-secondary">Volver</button>
            </Link>
            <button type="button" onClick={handleSave} disabled={loading} className="btn btn-primary disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar y Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
