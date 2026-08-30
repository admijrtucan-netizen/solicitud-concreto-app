'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [stats, setStats] = useState({
    solicitudesEnProceso: 12,
    solicitudesCompletas: 45,
    informesGenerados: 38,
  })

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="En Proceso"
          value={stats.solicitudesEnProceso}
          subtitle="Solicitudes activas"
          icon="⏳"
          color="var(--brand-red)"
        />
        <StatCard
          title="Completadas"
          value={stats.solicitudesCompletas}
          subtitle="Solicitudes finalizadas"
          icon="✓"
          color="#10b981"
        />
        <StatCard
          title="Informes"
          value={stats.informesGenerados}
          subtitle="Informes de campo"
          icon="📊"
          color="#3b82f6"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-t-4" style={{ borderTopColor: 'var(--brand-red)' }}>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--brand-black)' }}>
          Filtrar por Rango de Fechas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-gray-dark)' }}>
              Desde:
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
              style={{
                borderColor: '#d1d5db',
                focusRingColor: 'var(--brand-red)',
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--brand-gray-dark)' }}>
              Hasta:
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none"
              style={{
                borderColor: '#d1d5db',
                focusRingColor: 'var(--brand-red)',
              }}
            />
          </div>
          <div className="flex items-end">
            <button
              className="w-full px-6 py-2 rounded-md font-medium text-white transition-opacity"
              style={{
                backgroundColor: 'var(--brand-red)',
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          title="SOLICITUD DE SERVICIO"
          description="Crear una nueva solicitud de servicio de concreto"
          icon="📝"
          href="/new-solicitud"
          color="var(--brand-red)"
        />
        <ActionCard
          title="INFORME DE CAMPO"
          description="Registrar informe de campo y muestras de concreto"
          icon="📋"
          href="/new-informe"
          color="#3b82f6"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentLink
          title="Plantillas de Solicitud"
          description="Acceder a documentos PDF de solicitudes"
          icon="📄"
          href="https://drive.google.com/drive/u/1/folders/1nSqGJzjwHMSj9LRzJCipYLiDSvsO8G-i"
        />
        <DocumentLink
          title="Plantillas de Informes"
          description="Acceder a documentos PDF de informes"
          icon="📄"
          href="https://drive.google.com/drive/u/1/folders/1ZkYjs4TxIv4viZlXxYbwbR9qSt72EyeT"
        />
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--brand-gray-medium)' }}>
            {title}
          </p>
          <p className="text-4xl font-bold mb-2" style={{ color: color }}>
            {value}
          </p>
          <p className="text-xs" style={{ color: 'var(--brand-gray-medium)' }}>
            {subtitle}
          </p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  )
}

function ActionCard({ title, description, icon, href, color }) {
  return (
    <Link href={href}>
      <div
        className="bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-xl transition-all transform hover:scale-105 border-t-4"
        style={{ borderTopColor: color }}
      >
        <div className="flex items-start gap-4">
          <div className="text-5xl">{icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--brand-black)' }}>
              {title}
            </h3>
            <p className="text-sm" style={{ color: 'var(--brand-gray-medium)' }}>
              {description}
            </p>
          </div>
        </div>
        <div className="mt-4 text-sm font-medium" style={{ color }}>
          Ingresar →
        </div>
      </div>
    </Link>
  )
}

function DocumentLink({ title, description, icon, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <div className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{icon}</span>
          <h3 className="text-lg font-bold" style={{ color: 'var(--brand-black)' }}>
            {title}
          </h3>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--brand-gray-medium)' }}>
          {description}
        </p>
        <div className="text-sm font-medium" style={{ color: 'var(--brand-red)' }}>
          Abrir en Google Drive →
        </div>
      </div>
    </a>
  )
}
