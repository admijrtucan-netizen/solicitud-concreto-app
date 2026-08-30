'use client'

import { useState, useRef } from 'react'
import SignaturePad from 'signature_pad'

export default function SignatureWithAuth({ role = 'laboratorista', onSignatureComplete }) {
  const [step, setStep] = useState('auth') // 'auth' | 'sign' | 'complete'
  const [folio, setFolio] = useState('')
  const [personalInfo, setPersonalInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signature, setSignature] = useState(null)
  const canvasRef = useRef(null)
  const signaturePadRef = useRef(null)

  const handleValidateFolio = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/validate-folio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folio, role }),
      })

      const data = await response.json()

      if (!data.valid) {
        setError(data.message || 'Folio inválido')
        setLoading(false)
        return
      }

      setPersonalInfo(data)
      setStep('sign')
    } catch (err) {
      setError('Error al validar folio: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignatureComplete = () => {
    if (signaturePadRef.current?.isEmpty()) {
      setError('Por favor, firma en el área designada')
      return
    }

    const signatureData = signaturePadRef.current.toDataURL('image/png')
    setSignature(signatureData)
    setStep('complete')

    if (onSignatureComplete) {
      onSignatureComplete({
        folio,
        personalInfo,
        signature: signatureData,
      })
    }
  }

  const handleClearSignature = () => {
    signaturePadRef.current?.clear()
  }

  const handleReset = () => {
    setStep('auth')
    setFolio('')
    setPersonalInfo(null)
    setError('')
    setSignature(null)
    signaturePadRef.current?.clear()
  }

  // Step 1: Autenticación por Folio
  if (step === 'auth') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border-t-4" style={{ borderTopColor: 'var(--brand-red)' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--brand-black)' }}>
          Autenticación
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--brand-gray-medium)' }}>
          Ingresa tu folio de autorización para proceder con la firma
        </p>

        <form onSubmit={handleValidateFolio} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-gray-dark)' }}>
              Folio de Autorización:
            </label>
            <input
              type="text"
              value={folio}
              onChange={(e) => {
                setFolio(e.target.value)
                setError('')
              }}
              placeholder="Ingresa tu folio"
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
              style={{ borderColor: '#d1d5db' }}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 rounded-md text-sm text-white" style={{ backgroundColor: 'var(--brand-red)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!folio || loading}
            className="w-full py-2 rounded-md font-medium text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--brand-red)' }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {loading ? 'Validando...' : 'Continuar'}
          </button>
        </form>
      </div>
    )
  }

  // Step 2: Firma Digital
  if (step === 'sign') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border-t-4" style={{ borderTopColor: 'var(--brand-red)' }}>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--brand-black)' }}>
          Firma Digital
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--brand-gray-medium)' }}>
          Autenticado como: <strong>{personalInfo?.nombre}</strong> ({folio})
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-gray-dark)' }}>
            Firma:
          </label>
          <canvas
            ref={canvasRef}
            width={500}
            height={200}
            onMouseUp={() => {
              if (!signaturePadRef.current) {
                signaturePadRef.current = new SignaturePad(canvasRef.current)
              }
            }}
            className="border-2 rounded-md bg-white cursor-crosshair"
            style={{ borderColor: 'var(--brand-red)', display: 'block', width: '100%', maxWidth: '500px' }}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleClearSignature}
            className="flex-1 py-2 rounded-md font-medium text-white transition-opacity"
            style={{ backgroundColor: '#6b7280' }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Limpiar
          </button>
          <button
            onClick={handleSignatureComplete}
            className="flex-1 py-2 rounded-md font-medium text-white transition-opacity"
            style={{ backgroundColor: 'var(--brand-red)' }}
            onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Confirmar Firma
          </button>
        </div>
      </div>
    )
  }

  // Step 3: Confirmación
  if (step === 'complete') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border-t-4" style={{ borderTopColor: '#10b981' }}>
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">✓</div>
          <h3 className="text-xl font-bold" style={{ color: 'var(--brand-black)' }}>
            Firma Completada
          </h3>
        </div>

        {signature && (
          <div className="mb-4 p-3 bg-gray-100 rounded-md">
            <img src={signature} alt="Firma" className="w-full" />
          </div>
        )}

        <p className="text-sm mb-4 text-center" style={{ color: 'var(--brand-gray-medium)' }}>
          Firmado por: <strong>{personalInfo?.nombre}</strong>
        </p>

        <button
          onClick={handleReset}
          className="w-full py-2 rounded-md font-medium text-white transition-opacity"
          style={{ backgroundColor: 'var(--brand-gray-medium)' }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.9')}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          Firmar de Nuevo
        </button>
      </div>
    )
  }
}
