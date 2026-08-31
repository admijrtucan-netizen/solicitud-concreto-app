'use client'

import { useState, useEffect } from 'react'
import FormField from '@/components/FormField'

export default function ClienteSelector({ value, onChange, onClienteSelect }) {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newCliente, setNewCliente] = useState({
    nombre: '',
    telefono: '',
    email: '',
    rfc: '',
    contacto: '',
  })
  const [addingCliente, setAddingCliente] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const res = await fetch('/api/clientes/list', { cache: 'no-store' })
      const data = await res.json()
      console.log('Clientes recibidos:', data)
      setClientes(data.clientes || [])
    } catch (error) {
      console.error('Error fetching clientes:', error)
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCliente = async () => {
    setError('')

    if (!newCliente.nombre.trim()) {
      setError('El nombre de la empresa es requerido')
      return
    }

    setAddingCliente(true)

    try {
      const res = await fetch('/api/clientes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCliente),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Error al agregar cliente')
        setAddingCliente(false)
        return
      }

      setClientes([...clientes, data.cliente])
      onChange({ target: { name: 'Nombre de la empresa', value: newCliente.nombre } })
      if (onClienteSelect) {
        onClienteSelect(newCliente)
      }

      setNewCliente({ nombre: '', telefono: '', email: '', rfc: '', contacto: '' })
      setShowForm(false)
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setAddingCliente(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-600">Cargando clientes...</p>
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="form-label">Nombre de la Empresa</label>
        <div className="flex gap-2">
          <select
            value={value || ''}
            onChange={(e) => {
              const selected = clientes.find(c => c.nombre === e.target.value)
              onChange({ target: { name: 'Nombre de la empresa', value: e.target.value } })
              if (selected && onClienteSelect) {
                onClienteSelect(selected)
              }
            }}
            className="form-select flex-1"
          >
            <option value="">-- Seleccionar cliente --</option>
            {clientes.map((c) => (
              <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => { setShowForm(!showForm); setError('') }}
            className="btn btn-secondary"
          >
            +
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-4 bg-blue-50 border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
          <h3 className="text-sm font-bold mb-3">Registrar Nuevo Cliente</h3>
          {error && <div className="p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700 mb-3">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <FormField label="Nombre *" value={newCliente.nombre} onChange={(e) => setNewCliente({ ...newCliente, nombre: e.target.value })} />
            <FormField label="Teléfono" value={newCliente.telefono} onChange={(e) => setNewCliente({ ...newCliente, telefono: e.target.value })} />
            <FormField label="Email" type="email" value={newCliente.email} onChange={(e) => setNewCliente({ ...newCliente, email: e.target.value })} />
            <FormField label="RFC" value={newCliente.rfc} onChange={(e) => setNewCliente({ ...newCliente, rfc: e.target.value })} />
            <FormField label="Contacto" value={newCliente.contacto} onChange={(e) => setNewCliente({ ...newCliente, contacto: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleAddCliente} disabled={addingCliente} className="btn btn-primary flex-1 disabled:opacity-50">
              {addingCliente ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setNewCliente({ nombre: '', telefono: '', email: '', rfc: '', contacto: '' }) }} className="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
