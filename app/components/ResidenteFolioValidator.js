'use client'

import { useState } from 'react'
import FormField from '@/components/FormField'

export default function ResidenteFolioValidator({ value, onChange, onValidate, onNombreChange, onEmailChange, nombreValue, emailValue }) {
  const [generatedFolio, setGeneratedFolio] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [validationStatus, setValidationStatus] = useState(null) // 'success', 'error', null
  const [error, setError] = useState('')

  const handleGenerateFolio = async () => {
    setError('')

    if (!nombreValue?.trim()) {
      setError('El nombre del residente es requerido')
      return
    }

    if (!emailValue?.trim()) {
      setError('El email del residente es requerido')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/residente/generate-folio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreResidente: nombreValue,
          emailResidente: emailValue,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al generar folio')
        return
      }

      setGeneratedFolio(data.folioResidente)
      setValidationStatus(null)
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleValidateFolio = () => {
    setError('')

    if (!value?.trim()) {
      setError('Ingresa el folio recibido')
      setValidationStatus('error')
      return
    }

    if (value === generatedFolio) {
      setValidationStatus('success')
      onValidate(true)
    } else {
      setError('Folio incorrecto. Verifica que sea el mismo enviado por email')
      setValidationStatus('error')
      onValidate(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
        <h3 className="text-sm font-bold mb-4">Validación de Residente de Obra</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FormField
            label="Nombre Residente de Obra *"
            placeholder="Nombre completo"
            value={nombreValue || ''}
            onChange={(e) => onNombreChange(e.target.value)}
          />
          <FormField
            label="Email Residente *"
            type="email"
            placeholder="residente@example.com"
            value={emailValue || ''}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleGenerateFolio}
          disabled={generating || !nombreValue?.trim() || !emailValue?.trim()}
          className="btn btn-primary mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? 'Enviando folio...' : 'Generar y Enviar Folio'}
        </button>

        {generatedFolio && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded text-sm">
            <p className="font-semibold text-green-800">✓ Folio generado y enviado a {emailValue}</p>
            <p className="text-gray-700 text-xs mt-1">El residente recibirá el folio por email</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {generatedFolio && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Ingresa el folio que recibió el residente *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Folio de 6 dígitos"
                value={value || ''}
                onChange={(e) => {
                  // Permitir solo números
                  const numValue = e.target.value.replace(/\D/g, '')
                  setValidationStatus(null)
                  onValidate(false) // Reset validación si cambia
                  if (onChange) onChange(numValue)
                }}
                maxLength="6"
                className={`flex-1 px-4 py-2 border rounded-md focus:outline-none ${
                  validationStatus === 'success'
                    ? 'border-green-500 bg-green-50'
                    : validationStatus === 'error'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={handleValidateFolio}
                className={`px-6 py-2 rounded font-medium text-white transition ${
                  validationStatus === 'success'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {validationStatus === 'success' ? '✓ Validado' : 'Validar'}
              </button>
            </div>

            {validationStatus === 'success' && (
              <div className="p-2 bg-green-100 border border-green-300 rounded text-sm font-semibold text-green-800">
                ✓ Folio válido. El residente ha autorizado esta operación.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
