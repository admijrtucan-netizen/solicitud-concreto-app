'use client'

import Link from 'next/link'

export default function SolicitudPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center">
        <h2 className="text-2xl font-bold mb-8">
          SOLICITUD DE SERVICIO DE CONCRETO
        </h2>

        <p className="text-gray-600 mb-8">
          ¿Quién va a llenar esta solicitud?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/solicitud/oficina">
            <div className="p-8 border-2 border-red-300 rounded-lg hover:bg-red-50 cursor-pointer transition-colors">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                OFICINA
              </h3>
              <p className="text-gray-600">
                Llenar datos de cliente, obra y detalles técnicos
              </p>
            </div>
          </Link>

          <Link href="/solicitud/campo">
            <div className="p-8 border-2 border-red-300 rounded-lg hover:bg-red-50 cursor-pointer transition-colors">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                CAMPO
              </h3>
              <p className="text-gray-600">
                Completar información de muestras y resultados
              </p>
            </div>
          </Link>
        </div>

        <Link href="/">
          <button className="btn btn-secondary mt-8">
            Volver
          </button>
        </Link>
      </div>
    </div>
  )
}
