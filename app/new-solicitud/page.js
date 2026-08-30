'use client'

import Link from 'next/link'

export default function NewSolicitud() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-black)' }}>
          Nueva Solicitud de Servicio
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--brand-gray-medium)' }}>
          Selecciona el rol para continuar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/solicitud/oficina">
          <div className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border-l-4" style={{ borderLeftColor: 'var(--brand-red)' }}>
            <div className="text-5xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--brand-black)' }}>
              Rol Oficina
            </h2>
            <p className="mb-6" style={{ color: 'var(--brand-gray-medium)' }}>
              Crear una nueva solicitud con datos de cliente, obra y detalles técnicos del servicio de concreto.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--brand-red)' }}>✓</span>
                <span className="text-sm">Datos del cliente</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--brand-red)' }}>✓</span>
                <span className="text-sm">Detalles de la obra</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: 'var(--brand-red)' }}>✓</span>
                <span className="text-sm">Especificaciones técnicas</span>
              </div>
            </div>
            <button className="w-full py-3 rounded-md font-medium text-white transition-opacity" style={{ backgroundColor: 'var(--brand-red)' }} onMouseEnter={(e) => e.target.style.opacity = '0.9'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
              Continuar →
            </button>
          </div>
        </Link>

        <Link href="/solicitud/campo">
          <div className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
            <div className="text-5xl mb-4">🏗️</div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--brand-black)' }}>
              Rol Campo
            </h2>
            <p className="mb-6" style={{ color: 'var(--brand-gray-medium)' }}>
              Registrar muestras y datos de campo en una solicitud existente usando su folio.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <span style={{ color: '#3b82f6' }}>✓</span>
                <span className="text-sm">Seleccionar folio</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: '#3b82f6' }}>✓</span>
                <span className="text-sm">Datos de muestras</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: '#3b82f6' }}>✓</span>
                <span className="text-sm">Información de campo</span>
              </div>
            </div>
            <button className="w-full py-3 rounded-md font-medium text-white transition-opacity" style={{ backgroundColor: '#3b82f6' }} onMouseEnter={(e) => e.target.style.opacity = '0.9'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
              Continuar →
            </button>
          </div>
        </Link>
      </div>
    </div>
  )
}
