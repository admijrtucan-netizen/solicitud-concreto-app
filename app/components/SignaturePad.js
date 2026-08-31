'use client'

import { useRef, useState } from 'react'

export default function SignaturePad({ onSignatureCapture, label }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [uploading, setUploading] = useState(false)

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000'
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleTouchStart = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top)
    setIsDrawing(true)
  }

  const handleTouchMove = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000'
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top)
    ctx.stroke()
  }

  const handleTouchEnd = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Fondo blanco
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const savePad = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL('image/jpeg')
    onSignatureCapture(imageData)

    // Mostrar confirmación
    alert('Firma capturada correctamente')
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full touch-none cursor-crosshair bg-white"
          style={{ display: 'block' }}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 font-medium text-sm"
          disabled={isCleaning}
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={savePad}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm"
          disabled={uploading}
        >
          {uploading ? 'Guardando...' : 'Guardar Firma'}
        </button>
      </div>

      <p className="text-xs text-gray-500">Firma con dedo en dispositivos móviles o ratón en computadora</p>
    </div>
  )
}
