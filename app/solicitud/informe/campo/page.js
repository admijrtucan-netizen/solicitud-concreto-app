'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FormField from '@/components/FormField'
import TimeSelector from '@/components/TimeSelector'
import SignaturePad from '@/components/SignaturePad'

export default function InformeCampo() {
  const router = useRouter()
  const [cantMuestras, setCantMuestras] = useState(1)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedFolio, setSelectedFolio] = useState('')
  const [folios, setFolios] = useState([])
  const [loadingFolios, setLoadingFolios] = useState(true)
  const [personal, setPersonal] = useState([])

  useEffect(() => {
    fetchFolios()
    fetchPersonal()
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

  const fetchPersonal = async () => {
    try {
      const res = await fetch('/api/personal/list')
      if (res.ok) {
        const data = await res.json()
        setPersonal(data.personal || [])
      }
    } catch (error) {
      console.error('Error fetching personal:', error)
    }
  }

  const handleFolioSelect = () => {
    if (selectedFolio) setStep(2)
  }

  const [formData, setFormData] = useState({
    'Email Residente': '',
    'Termometro TA': '',
    'Termometro T': '',
    'Cono No.': '',
    'Carretilla No.': '',
    'Varilla No.': '',
    'Molde No.': '',
    'Mazo No.': '',
    'Cucharon No.': '',
    'Volumen de esta hoja': '',
    'Volumen total': '',
    'Ensazador No.': '',
    'Felx No.': '',
    'Placa de rev. No.': '',
    'Placa de extensibilidad No.': '',
    'Dia 1 Ensayo': false,
    'Dia 3 Ensayo': false,
    'Dia 7 Ensayo': false,
    'Dia 14 Ensayo': false,
    'Dia 28 Ensayo': false,
    'Otro Dia Ensayo': false,
    'Elaboro': '',
    'Elaboro Folio': '',
    'Solicita': '',
    'Solicita Folio': '',
    'Vo. Bo.': '',
    'Vo. Bo. Folio': '',
    'Observaciones': '',
    'Hora de muestreo': '',
  })

  const [signatures, setSignatures] = useState({
    'Elaboro firma': null,
    'Solicita firma': null,
    'Vo. Bo. firma': null,
  })

  const [muestras, setMuestras] = useState({})

  useEffect(() => {
    inicializarMuestras()
  }, [cantMuestras])

  const inicializarMuestras = () => {
    const newMuestras = {}
    for (let i = 1; i <= cantMuestras; i++) {
      newMuestras[`M${i}`] = {
        'No. Muestra': '',
        'No. Camion': '',
        'No. de Remision': '',
        'Salida Planta': '',
        'Llegada a obra': '',
        'Inicio descarga': '',
        'Termina descarga': '',
        'Volumen': '',
        'Edad de garantia': '',
        "F'c": '',
        'TMA': '',
        'Extensibilidad/Flujo de Rev.': '',
        'Revenimiento real': '',
        'Extensibilidad/Flujo de Rev. real': '',
        'Temp Concreto': '',
        'Temp Ambiente': '',
        'Humedad': '',
        'Localizacion': '',
      }
    }
    setMuestras(newMuestras)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    if (name === 'Cant. de Muestras Completas') {
      setCantMuestras(parseInt(value) || 1)
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }))
  }

  const handleMuestraChange = (muestra, field, value) => {
    setMuestras(prev => ({
      ...prev,
      [muestra]: {
        ...prev[muestra],
        [field]: value,
      },
    }))
  }

  const handleSignature = (field, imageData) => {
    setSignatures(prev => ({
      ...prev,
      [field]: imageData,
    }))
  }

  const handleSave = async () => {
    if (!formData['Elaboro Folio'] || !formData['Solicita Folio'] || !formData['Vo. Bo. Folio']) {
      alert('Por favor ingresa todos los folios de autorizacion')
      return
    }

    setLoading(true)
    try {
      const dataToSave = {
        ...formData,
        'Cant. de Muestras Completas': cantMuestras,
        'FOLIO TUCAN': selectedFolio,
        ...signatures,
        muestras,
        ETAPA: 'LISTO',
      }

      const res = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
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

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold mb-2">INFORME DE CAMPO - CAMPO</h2>
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
              onClick={handleFolioSelect}
              disabled={!selectedFolio}
              className="btn btn-primary disabled:opacity-50"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2">INFORME DE CAMPO - CAMPO</h2>
        <p className="text-sm text-gray-600 mb-6">Folio: {selectedFolio}</p>

        <form noValidate>
          <h3 className="text-lg font-semibold mb-4">Cantidad de Muestras</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Cant. de Muestras Completas"
              name="Cant. de Muestras Completas"
              type="number"
              min="1"
              max="10"
              value={cantMuestras}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8">Email Residente de Obra</h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              label="Email Residente"
              name="Email Residente"
              type="email"
              placeholder="residente@example.com"
              value={formData['Email Residente']}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8">Equipos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Termometro TA"
              name="Termometro TA"
              value={formData['Termometro TA']}
              onChange={handleChange}
            />
            <FormField
              label="Termometro T"
              name="Termometro T"
              value={formData['Termometro T']}
              onChange={handleChange}
            />
            <FormField
              label="Cono No."
              name="Cono No."
              value={formData['Cono No.']}
              onChange={handleChange}
            />
            <FormField
              label="Carretilla No."
              name="Carretilla No."
              value={formData['Carretilla No.']}
              onChange={handleChange}
            />
            <FormField
              label="Varilla No."
              name="Varilla No."
              value={formData['Varilla No.']}
              onChange={handleChange}
            />
            <FormField
              label="Molde No."
              name="Molde No."
              value={formData['Molde No.']}
              onChange={handleChange}
            />
            <FormField
              label="Mazo No."
              name="Mazo No."
              value={formData['Mazo No.']}
              onChange={handleChange}
            />
            <FormField
              label="Cucharon No."
              name="Cucharon No."
              value={formData['Cucharon No.']}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8">Volumen y Placas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Volumen de esta hoja (m3)"
              name="Volumen de esta hoja"
              type="number"
              value={formData['Volumen de esta hoja']}
              onChange={handleChange}
            />
            <FormField
              label="Volumen total (m3)"
              name="Volumen total"
              type="number"
              value={formData['Volumen total']}
              onChange={handleChange}
            />
            <FormField
              label="Ensazador No."
              name="Ensazador No."
              value={formData['Ensazador No.']}
              onChange={handleChange}
            />
            <FormField
              label="Felx No."
              name="Felx No."
              value={formData['Felx No.']}
              onChange={handleChange}
            />
            <FormField
              label="Placa de rev. No."
              name="Placa de rev. No."
              value={formData['Placa de rev. No.']}
              onChange={handleChange}
            />
            <FormField
              label="Placa de extensibilidad No."
              name="Placa de extensibilidad No."
              value={formData['Placa de extensibilidad No.']}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8">Dias de Ensayo</h3>
          <div className="space-y-2">
            {['Dia 1 Ensayo', 'Dia 3 Ensayo', 'Dia 7 Ensayo', 'Dia 14 Ensayo', 'Dia 28 Ensayo', 'Otro Dia Ensayo'].map(field => (
              <FormField
                key={field}
                label={field}
                name={field}
                type="checkbox"
                value={formData[field]}
                onChange={handleChange}
              />
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8">Informacion General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimeSelector
              label="Hora de muestreo"
              name="Hora de muestreo"
              value={formData['Hora de muestreo']}
              onChange={handleChange}
            />
          </div>

          <FormField
            label="Observaciones"
            name="Observaciones"
            type="textarea"
            value={formData['Observaciones']}
            onChange={handleChange}
          />

          {Array.from({ length: cantMuestras }).map((_, idx) => {
            const muestraNum = idx + 1
            const muestraKey = `M${muestraNum}`
            const muestra = muestras[muestraKey] || {}

            return (
              <div key={muestraKey} className="mt-8 pt-8 border-t-2 border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Muestra {muestraNum}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="No. Muestra"
                    value={muestra['No. Muestra'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'No. Muestra', e.target.value)}
                  />
                  <FormField
                    label="No. Camion"
                    value={muestra['No. Camion'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'No. Camion', e.target.value)}
                  />
                  <FormField
                    label="No. de Remision"
                    value={muestra['No. de Remision'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'No. de Remision', e.target.value)}
                  />
                  <FormField
                    label="Salida Planta"
                    type="time"
                    value={muestra['Salida Planta'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Salida Planta', e.target.value)}
                  />
                  <FormField
                    label="Llegada a obra"
                    type="time"
                    value={muestra['Llegada a obra'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Llegada a obra', e.target.value)}
                  />
                  <FormField
                    label="Inicio descarga"
                    type="time"
                    value={muestra['Inicio descarga'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Inicio descarga', e.target.value)}
                  />
                  <FormField
                    label="Termina descarga"
                    type="time"
                    value={muestra['Termina descarga'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Termina descarga', e.target.value)}
                  />
                  <FormField
                    label="Volumen (m3)"
                    type="number"
                    value={muestra['Volumen'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Volumen', e.target.value)}
                  />
                  <FormField
                    label="Edad de garantia"
                    value={muestra['Edad de garantia'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Edad de garantia', e.target.value)}
                  />
                  <FormField
                    label="F'c (kg/cm2)"
                    type="number"
                    value={muestra["F'c"] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, "F'c", e.target.value)}
                  />
                  <FormField
                    label="TMA (mm)"
                    type="number"
                    value={muestra['TMA'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'TMA', e.target.value)}
                  />
                  <FormField
                    label="Extensibilidad/Flujo de Rev. (cm)"
                    type="number"
                    value={muestra['Extensibilidad/Flujo de Rev.'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Extensibilidad/Flujo de Rev.', e.target.value)}
                  />
                  <FormField
                    label="Revenimiento real (cm)"
                    type="number"
                    value={muestra['Revenimiento real'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Revenimiento real', e.target.value)}
                  />
                  <FormField
                    label="Extensibilidad/Flujo de Rev. real (cm)"
                    type="number"
                    value={muestra['Extensibilidad/Flujo de Rev. real'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Extensibilidad/Flujo de Rev. real', e.target.value)}
                  />
                  <FormField
                    label="Temp Concreto (C)"
                    type="number"
                    value={muestra['Temp Concreto'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Temp Concreto', e.target.value)}
                  />
                  <FormField
                    label="Temp Ambiente (C)"
                    type="number"
                    value={muestra['Temp Ambiente'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Temp Ambiente', e.target.value)}
                  />
                  <FormField
                    label="Humedad (%)"
                    type="number"
                    value={muestra['Humedad'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Humedad', e.target.value)}
                  />
                  <FormField
                    label="Localizacion"
                    value={muestra['Localizacion'] || ''}
                    onChange={(e) => handleMuestraChange(muestraKey, 'Localizacion', e.target.value)}
                  />
                </div>
              </div>
            )
          })}

          <h3 className="text-lg font-semibold mb-4 mt-8">Firmas - Laboratorista</h3>
          <div className="grid grid-cols-1 gap-4 p-4 bg-blue-50 border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Laboratorista (Nombre)"
                name="Elaboro"
                type="text"
                placeholder="Nombre"
                value={formData['Elaboro']}
                onChange={handleChange}
              />
              <FormField
                label="Folio de Autorizacion"
                name="Elaboro Folio"
                type="text"
                placeholder="Ingresa folio"
                value={formData['Elaboro Folio']}
                onChange={handleChange}
              />
            </div>
            <SignaturePad
              onSignatureCapture={(sig) => handleSignature('Elaboro firma', sig)}
              label="Firma Laboratorista"
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8">Firmas - Supervisor</h3>
          <div className="grid grid-cols-1 gap-4 p-4 bg-green-50 border-l-4" style={{ borderLeftColor: '#10b981' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Supervisor (Nombre)"
                name="Solicita"
                type="text"
                placeholder="Nombre"
                value={formData['Solicita']}
                onChange={handleChange}
              />
              <FormField
                label="Folio de Autorizacion"
                name="Solicita Folio"
                type="text"
                placeholder="Ingresa folio"
                value={formData['Solicita Folio']}
                onChange={handleChange}
              />
            </div>
            <SignaturePad
              onSignatureCapture={(sig) => handleSignature('Solicita firma', sig)}
              label="Firma Supervisor"
            />
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8">Firmas - Visto Bueno</h3>
          <div className="grid grid-cols-1 gap-4 p-4 bg-yellow-50 border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Vo. Bo. (Nombre)"
                name="Vo. Bo."
                type="text"
                placeholder="Nombre"
                value={formData['Vo. Bo.']}
                onChange={handleChange}
              />
              <FormField
                label="Folio de Autorizacion"
                name="Vo. Bo. Folio"
                type="text"
                placeholder="Ingresa folio"
                value={formData['Vo. Bo. Folio']}
                onChange={handleChange}
              />
            </div>
            <SignaturePad
              onSignatureCapture={(sig) => handleSignature('Vo. Bo. firma', sig)}
              label="Firma Visto Bueno"
            />
          </div>

          <div className="flex gap-4 mt-8">
            <Link href="/solicitud/informe">
              <button type="button" className="btn btn-secondary">
                Volver
              </button>
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Informe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
