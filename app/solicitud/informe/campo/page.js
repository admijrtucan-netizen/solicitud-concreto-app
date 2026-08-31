'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FormField from '@/components/FormField'
import TimeSelector from '@/components/TimeSelector'
import SignaturePad from '@/components/SignaturePad'
import ResidenteFolioValidator from '@/components/ResidenteFolioValidator'
import MuestraRevendimiento from '@/components/MuestraRevendimiento'

export default function InformeCampo() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedFolio, setSelectedFolio] = useState('')
  const [folios, setFolios] = useState([])
  const [loadingFolios, setLoadingFolios] = useState(true)
  const [personal, setPersonal] = useState([])
  const [residenteFolioValid, setResidenteFolioValid] = useState(false)
  const [residenteNombre, setResidenteNombre] = useState('')
  const [residenteEmail, setResidenteEmail] = useState('')
  const [residenteFolio, setResidenteFolio] = useState('')
  const [clientePreview, setClientePreview] = useState(null)
  const [folioError, setFolioError] = useState('')

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

  const handleFolioSelect = async () => {
    if (!selectedFolio) return

    // Validar que el folio existe
    try {
      const res = await fetch('/api/folio/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folio: selectedFolio }),
      })

      const data = await res.json()

      if (!data.exists) {
        setFolioError(`❌ El folio ${selectedFolio} no existe o no es válido`)
        setClientePreview(null)
        return
      }

      // Cargar datos del cliente
      const resData = await fetch('/api/solicitud-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folio: selectedFolio }),
      })

      if (resData.ok) {
        const clienteData = await resData.json()
        setClientePreview(clienteData)
        setFolioError('')
        setStep(2)
      }
    } catch (error) {
      setFolioError('Error al validar folio')
      console.error(error)
    }
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

  const [muestras, setMuestras] = useState([
    { tipo: 'MUESTRA' }
  ])

  const handleMuestraChange = (index, data) => {
    const newMuestras = [...muestras]
    newMuestras[index] = data
    setMuestras(newMuestras)
  }

  const handleAgregarMuestra = () => {
    if (muestras.length < 100) {
      setMuestras([...muestras, { tipo: 'MUESTRA' }])
    }
  }

  const handleEliminarMuestra = (index) => {
    if (muestras.length > 1) {
      const newMuestras = muestras.filter((_, i) => i !== index)
      setMuestras(newMuestras)
    }
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


  const handleSignature = (field, imageData) => {
    setSignatures(prev => ({
      ...prev,
      [field]: imageData,
    }))
  }

  const handleSave = async () => {
    if (!residenteFolioValid) {
      alert('El folio del residente debe ser validado primero')
      return
    }

    if (!signatures['Solicita firma']) {
      alert('La firma del residente es obligatoria')
      return
    }

    if (!formData['Elaboro Folio'] || !formData['Solicita Folio'] || !formData['Vo. Bo. Folio']) {
      alert('Por favor ingresa todos los folios de autorizacion')
      return
    }

    setLoading(true)
    try {
      // Subir firmas a Google Drive
      const signatureUrls = {}
      for (const [signatureType, signatureData] of Object.entries(signatures)) {
        if (signatureData) {
          const uploadRes = await fetch('/api/signatures/upload-to-drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              folio: selectedFolio,
              signatureType: signatureType,
              signatureBase64: signatureData,
              nombreResidente: residenteNombre,
            }),
          })

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json()
            signatureUrls[signatureType] = uploadData.fileUrl
          }
        }
      }

      // Convertir array de muestras a formato M1, M2, M3... para Sheets
      const muestrasPlanas = {}
      muestras.forEach((muestra, idx) => {
        const mNum = idx + 1
        if (muestra.tipo) {
          muestrasPlanas[`M${mNum} Tipo`] = muestra.tipo
        }
        // Campos comunes
        if (muestra.noMuestra) muestrasPlanas[`M${mNum} No. Muestra`] = muestra.noMuestra
        if (muestra.noCamion) muestrasPlanas[`M${mNum} No. Camión`] = muestra.noCamion
        if (muestra.noRemision) muestrasPlanas[`M${mNum} No. de Remisión`] = muestra.noRemision
        if (muestra.salidaPlanta) muestrasPlanas[`M${mNum} Salida Planta`] = muestra.salidaPlanta
        if (muestra.llegadaObra) muestrasPlanas[`M${mNum} Llegada a obra`] = muestra.llegadaObra
        if (muestra.inicioDescarga) muestrasPlanas[`M${mNum} Inicio descarga`] = muestra.inicioDescarga
        if (muestra.terminaDescarga) muestrasPlanas[`M${mNum} Termina descarga`] = muestra.terminaDescarga
        if (muestra.volumen) muestrasPlanas[`M${mNum} Volumen (m³)`] = muestra.volumen

        // Campos MUESTRA
        if (muestra.tipo === 'MUESTRA') {
          if (muestra.fc) muestrasPlanas[`M${mNum} F'c (kg/cm²)`] = muestra.fc
          if (muestra.tma) muestrasPlanas[`M${mNum} TMA (mm)`] = muestra.tma
          if (muestra.revenimientoReal) muestrasPlanas[`M${mNum} Revenimiento real (cm)`] = muestra.revenimientoReal
        }

        // Campos REVENDIMIENTO
        if (muestra.tipo === 'REVENDIMIENTO') {
          if (muestra.edadGarantia) muestrasPlanas[`M${mNum} Edad de garantía`] = muestra.edadGarantia
          if (muestra.extensibilidad) muestrasPlanas[`M${mNum} Extensibilidad/Flujo de Rev. (cm)`] = muestra.extensibilidad
          if (muestra.extensibilidadReal) muestrasPlanas[`M${mNum} Extensibilidad/Flujo de Rev. real (cm)`] = muestra.extensibilidadReal
          // Guardar solo el tipo sin la "T" (D en lugar de TD, B en lugar de TB)
          const tipoD = (muestra.termoConcretoTipo || 'TD').replace('T', '')
          const tipoB = (muestra.termoAmbienteTipo || 'TD').replace('T', '')
          if (muestra.tempConcretoValue) muestrasPlanas[`M${mNum} Temp Concreto`] = `${tipoD}; ${muestra.tempConcretoValue}°C`
          if (muestra.tempAmbienteValue) muestrasPlanas[`M${mNum} Temp Ambiente (°C)`] = `${tipoB}; ${muestra.tempAmbienteValue}°C`
        }
      })

      const dataToSave = {
        ...formData,
        'Cant. de Muestras Completas': muestras.length,
        'FOLIO TUCAN': selectedFolio,
        'Nombre Residente': residenteNombre,
        'Email Residente': residenteEmail,
        'Folio Residente': residenteFolio,
        ...signatureUrls,
        ...muestrasPlanas,
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
                onChange={(e) => {
                  setSelectedFolio(e.target.value)
                  setFolioError('')
                  setClientePreview(null)
                }}
                className="form-select"
              >
                <option value="">-- Seleccionar un folio --</option>
                {folios.map(folio => (
                  <option key={folio} value={folio}>{folio}</option>
                ))}
              </select>
            )}
          </div>

          {folioError && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded text-sm text-red-700">
              {folioError}
            </div>
          )}

          {clientePreview && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded">
              <h3 className="font-bold text-blue-900 mb-3">📋 Datos de la Solicitud</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Empresa:</p>
                  <p className="font-semibold">{clientePreview['Nombre de la empresa']}</p>
                </div>
                <div>
                  <p className="text-gray-600">Obra:</p>
                  <p className="font-semibold">{clientePreview['Dirección de la obra']}</p>
                </div>
                <div>
                  <p className="text-gray-600">Residente:</p>
                  <p className="font-semibold">{clientePreview['Nombre Residente de obra']}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fecha de Servicio:</p>
                  <p className="font-semibold">{clientePreview['Fecha de Servicio']}</p>
                </div>
              </div>
            </div>
          )}

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

          <h3 className="text-lg font-semibold mb-4 mt-8">Validación de Residente</h3>
          <ResidenteFolioValidator
            value={residenteFolio}
            onChange={setResidenteFolio}
            onValidate={setResidenteFolioValid}
            nombreValue={residenteNombre}
            emailValue={residenteEmail}
            onNombreChange={setResidenteNombre}
            onEmailChange={setResidenteEmail}
          />

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

          <h3 className="text-lg font-semibold mb-4 mt-8">Placas y Equipos de Medición</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <h3 className="text-lg font-semibold mb-4 mt-8">Muestras y Revendimientos ({muestras.length}/100)</h3>

          {muestras.map((muestra, idx) => (
            <MuestraRevendimiento
              key={idx}
              index={idx}
              data={muestra}
              onChange={handleMuestraChange}
              onRemove={handleEliminarMuestra}
              isLast={idx === muestras.length - 1}
            />
          ))}

          {muestras.length < 100 && (
            <button
              type="button"
              onClick={handleAgregarMuestra}
              className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
            >
              + Agregar Muestra/Revendimiento
            </button>
          )}

          <h3 className="text-lg font-semibold mb-4 mt-8">Firmas - Laboratorista</h3>
          <div className="grid grid-cols-1 gap-4 p-4 bg-blue-50 border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Laboratorista</label>
                <select
                  value={formData['Elaboro'] || ''}
                  onChange={(e) => handleChange({
                    target: { name: 'Elaboro', value: e.target.value }
                  })}
                  className="form-select"
                >
                  <option value="">-- Seleccionar laboratorista --</option>
                  {personal.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>
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

          <h3 className="text-lg font-semibold mb-4 mt-8">Firmas - Residente de Obra</h3>
          <div className="grid grid-cols-1 gap-4 p-4 bg-green-50 border-l-4" style={{ borderLeftColor: '#10b981' }}>
            <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded text-sm">
              <p className="font-semibold text-green-800">
                {residenteFolioValid ? '✓ Residente validado' : '⚠️ Residente no validado'}
              </p>
              <p className="text-gray-700">{residenteNombre || 'Nombre del residente'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Nombre Residente"
                name="Solicita"
                type="text"
                placeholder={residenteNombre || 'Nombre'}
                value={formData['Solicita'] || residenteNombre}
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
              label="Firma Residente (OBLIGATORIA)"
            />
            {!signatures['Solicita firma'] && (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700">
                ⚠️ La firma del residente es obligatoria para autorizar esta operación
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-4 mt-8">Firmas - Supervisor de Laboratorio</h3>
          <div className="grid grid-cols-1 gap-4 p-4 bg-yellow-50 border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Supervisor de Laboratorio</label>
                <select
                  value={formData['Vo. Bo.'] || ''}
                  onChange={(e) => handleChange({
                    target: { name: 'Vo. Bo.', value: e.target.value }
                  })}
                  className="form-select"
                >
                  <option value="">-- Seleccionar supervisor --</option>
                  {personal.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>
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
              label="Firma Supervisor de Laboratorio"
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
