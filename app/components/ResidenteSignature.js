'use client'

import { useState, useRef } from 'react'
import SignaturePad from 'signature_pad'

export default function ResidenteSignature({ folio, onSignatureComplete }) {
  const [step, setStep] = useState('email') // 'email' | 'code' | 'sign' | 'complete'
  const [email, setEmail] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [signature, setSignature] = useState(null)
  const [residenteName, setResidenteName] = useState('')
  const canvasRef = useRef(null)
  const signaturePadRef = useRef(null)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-residente-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, folio }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || 'Error al enviar código')
        setLoading(false)
        return
      }

      setResidenteName(data.nombre)
      setStep('code')
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleValidateCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-residente-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, folio, authCode }),
      })

      const data = await response.json()

      if (!data.valid) {
        setError(data.message || 'Código inválido')
        setLoading(false)
        return
      }

      setStep('sign')
    } catch (err) {
      setError('Error: ' + err.message)
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
        email,
        nombre: residenteName,
        signature: signatureData,
      })
    }
  }

  const handleClearSignature = () => {
    signaturePadRef.current?.clear()
  }

  // Step 1: Registro de Email
  if (step === 'email') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border-t-4" style={{ borderTopColor: 'var(--brand-red)' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--brand-black)' }}>
          Residente de Obra
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--brand-gray-medium)' }}>
          Ingresa tu email para recibir un código de autenticación
        </p>

        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-gray-dark)' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="tu@email.com"
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
              style={{ borderColor: '#d1d5db' }}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-md text-sm text-white" style={{ backgroundColor: 'var(--brand-red)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!email || loading}
            className="w-full py-2 rounded-md font-medium text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--brand-red)' }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {loading ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>
      </div>
    )
  }

  // Step 2: Validación de Código
  if (step === 'code') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border-t-4" style={{ borderTopColor: 'var(--brand-red)' }}>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--brand-black)' }}>
          Verificación
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--brand-gray-medium)' }}>
          Revisa tu email ({email}) y ingresa el código de autenticación
        </p>

        <form onSubmit={handleValidateCode} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-gray-dark)' }}>
              Código:
            </label>
            <input
              type="text"
              value={authCode}
              onChange={(e) => {
                setAuthCode(e.target.value.toUpperCase())
                setError('')
              }}
              placeholder="XXXXXX"
              maxLength="6"
              className="w-full px-4 py-2 border rounded-md focus:outline-none text-center text-2xl tracking-widest"
              style={{ borderColor: '#d1d5db' }}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-md text-sm text-white" style={{ backgroundColor: 'var(--brand-red)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!authCode || loading}
            className="w-full py-2 rounded-md font-medium text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--brand-red)' }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
      </div>
    )
  }

  // Step 3: Firma Digital
  if (step === 'sign') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border-t-4" style={{ borderTopColor: 'var(--brand-red)' }}>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--brand-black)' }}>
          Firma Digital - Residente de Obra
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--brand-gray-medium)' }}>
          Folio: <strong>{folio}</strong>
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

  // Step 4: Confirmación
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

        <p className="text-sm text-center" style={{ color: 'var(--brand-gray-medium)' }}>
          Firmado por residente de obra
        </p>
      </div>
    )
  }
}
