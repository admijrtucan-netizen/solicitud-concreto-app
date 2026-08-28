'use client'

import { useRef, useEffect, useState } from 'react'

export default function SignaturePad({ onSignatureCapture, label = 'Firma' }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
    }
  }, [])

  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX ? e.clientX - rect.left : e.touches?.[0]?.clientX - rect.left
    const y = e.clientY ? e.clientY - rect.top : e.touches?.[0]?.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX ? e.clientX - rect.left : e.touches?.[0]?.clientX - rect.left
    const y = e.clientY ? e.clientY - rect.top : e.touches?.[0]?.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const captureSignature = () => {
    const canvas = canvasRef.current
    const imageData = canvas.toDataURL('image/png')
    onSignatureCapture(imageData)
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="border-2 border-gray-300 rounded-md p-2">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          className="w-full border border-gray-200 bg-white cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={clearSignature}
          className="btn btn-secondary"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={captureSignature}
          disabled={!hasSignature}
          className="btn btn-success disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Guardar Firma
        </button>
      </div>
    </div>
  )
}
