'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)

  const menuItems = [
    {
      label: 'Inicio',
      icon: '🏠',
      href: '/',
    },
    {
      label: 'Nueva Solicitud',
      icon: '📝',
      href: '/new-solicitud',
    },
    {
      label: 'Nuevo Informe',
      icon: '📋',
      href: '/new-informe',
    },
    {
      label: 'Estatus',
      icon: '📊',
      href: '/status',
    },
    {
      label: 'Documentos',
      icon: '📂',
      children: [
        { label: 'Solicitudes PDF', icon: '📄', href: 'https://drive.google.com/drive/u/1/folders/1nSqGJzjwHMSj9LRzJCipYLiDSvsO8G-i', external: true },
        { label: 'Informes PDF', icon: '📄', href: 'https://drive.google.com/drive/u/1/folders/1ZkYjs4TxIv4viZlXxYbwbR9qSt72EyeT', external: true },
      ]
    },
  ]

  return (
    <aside
      className={`transition-all duration-300 border-r flex flex-col`}
      style={{
        width: isExpanded ? '280px' : '80px',
        backgroundColor: 'var(--brand-black)',
        borderRightColor: 'var(--brand-red)',
        borderRightWidth: '3px',
      }}
    >
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded hover:bg-gray-800 transition-colors text-white"
          title={isExpanded ? 'Contraer' : 'Expandir'}
        >
          {isExpanded ? '«' : '»'}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {isExpanded ? item.label : item.icon}
                </div>
                <div className="space-y-1">
                  {item.children.map((child) => (
                    <a
                      key={child.label}
                      href={child.href}
                      target={child.external ? '_blank' : undefined}
                      rel={child.external ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded transition-colors text-sm group"
                    >
                      <span className="text-lg flex-shrink-0">{child.icon}</span>
                      {isExpanded && <span>{child.label}</span>}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors group"
                title={!isExpanded ? item.label : undefined}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {isExpanded && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t" style={{ borderTopColor: 'var(--brand-red)' }}>
        <div className="text-xs text-gray-500 text-center">
          {isExpanded ? '© 2026 INNOVAR' : '©'}
        </div>
      </div>
    </aside>
  )
}
