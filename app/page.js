'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [selectedType, setSelectedType] = useState(null)

  if (selectedType === 'solicitud') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-2xl">
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-8 text-gray-900">
              SOLICITUD DE SERVICIO DE CONCRETO
            </h2>

            <p className="text-gray-600 mb-8">
              ¿Quién va a llenar esta solicitud?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/solicitud/oficina">
                <div className="p-8 border-2 border-blue-300 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">
                    OFICINA
                  </h3>
                  <p className="text-gray-600">
                    Llenar datos de cliente, obra y detalles técnicos
                  </p>
                </div>
              </Link>

              <Link href="/solicitud/campo">
                <div className="p-8 border-2 border-green-300 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                  <h3 className="text-xl font-bold text-green-600 mb-4">
                    CAMPO
                  </h3>
                  <p className="text-gray-600">
                    Completar información de muestras y resultados
                  </p>
                </div>
              </Link>
            </div>

            <button
              onClick={() => setSelectedType(null)}
              className="btn btn-secondary mt-8"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="max-w-2xl">
        <div className="card text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            ¿Qué deseas registrar?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedType('solicitud')}
              className="p-8 border-2 border-blue-300 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors text-left"
            >
              <h3 className="text-xl font-bold text-blue-600 mb-4">
                SOLICITUD DE SERVICIO DE CONCRETO
              </h3>
              <p className="text-gray-600 mb-4">
                Llenar información de cliente, obra y detalles técnicos del servicio
              </p>
              <span className="text-sm text-gray-500">
                Rol: Oficina / Campo
              </span>
            </button>

            <Link href="/solicitud/informe">
              <div className="p-8 border-2 border-green-300 rounded-lg hover:bg-green-50 cursor-pointer transition-colors">
                <h3 className="text-xl font-bold text-green-600 mb-4">
                  INFORME DE CAMPO DE CONCRETO FRESCO
                </h3>
                <p className="text-gray-600 mb-4">
                  Registrar datos de campo y resultados de muestras tomadas
                </p>
                <span className="text-sm text-gray-500">
                  Rol: Campo
                </span>
              </div>
            </Link>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Nota:</strong> Cada registro se vincula mediante un folio único (INN-xxxxx)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
