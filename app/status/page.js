'use client'

import { useState } from 'react'

export default function StatusPage() {
  const [statusFilter, setStatusFilter] = useState('todos')
  const [typeFilter, setTypeFilter] = useState('todos')

  const registros = [
    { id: 1, folio: 'INN-34565', tipo: 'Solicitud', estado: 'Completada', cliente: 'Constructora ABC', fecha: '2026-08-28' },
    { id: 2, folio: 'INN-00001', tipo: 'Informe', estado: 'En Proceso', cliente: 'Proyecto XYZ', fecha: '2026-08-25' },
    { id: 3, folio: 'INN-00002', tipo: 'Solicitud', estado: 'Completada', cliente: 'Obra Beta', fecha: '2026-08-20' },
    { id: 4, folio: 'INN-34566', tipo: 'Informe', estado: 'Pendiente', cliente: 'Constructora Gamma', fecha: '2026-08-15' },
  ]

  const filtered = registros.filter((r) => {
    const matchStatus = statusFilter === 'todos' || r.estado === statusFilter
    const matchType = typeFilter === 'todos' || r.tipo === typeFilter
    return matchStatus && matchType
  })

  const estatusOptions = ['Pendiente', 'En Proceso', 'Completada']
  const statusColors = {
    'Pendiente': '#f59e0b',
    'En Proceso': 'var(--brand-red)',
    'Completada': '#10b981',
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-black)' }}>
          Estatus de Registros
        </h1>
        <p className="text-sm mt-2" style={{ color: 'var(--brand-gray-medium)' }}>
          Monitorea el estado de todas tus solicitudes e informes
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4" style={{ borderTopColor: 'var(--brand-red)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-gray-dark)' }}>
              Estado:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
              style={{ borderColor: '#d1d5db' }}
            >
              <option value="todos">Todos los estados</option>
              {estatusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-gray-dark)' }}>
              Tipo:
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
              style={{ borderColor: '#d1d5db' }}
            >
              <option value="todos">Todos los tipos</option>
              <option value="Solicitud">Solicitudes</option>
              <option value="Informe">Informes</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full px-6 py-2 rounded-md font-medium text-white transition-opacity"
              style={{ backgroundColor: 'var(--brand-red)' }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.length > 0 ? (
          filtered.map((registro) => (
            <div key={registro.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: statusColors[registro.estado] }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: statusColors[registro.estado] }}>
                      {registro.estado}
                    </div>
                    <span className="text-sm font-mono font-bold" style={{ color: 'var(--brand-red)' }}>
                      {registro.folio}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#f3f4f6', color: 'var(--brand-gray-dark)' }}>
                      {registro.tipo}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--brand-black)' }}>
                    {registro.cliente}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--brand-gray-medium)' }}>
                    Última actualización: {new Date(registro.fecha).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <button
                  className="px-6 py-2 rounded-md font-medium text-white transition-opacity"
                  style={{ backgroundColor: 'var(--brand-red)' }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-lg" style={{ color: 'var(--brand-gray-medium)' }}>
              No hay registros que coincidan con los filtros seleccionados
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
