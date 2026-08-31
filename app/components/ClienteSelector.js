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
      const res = await fetch('/api/clientes/list')
      if (res.ok) {
        const data = await res.json()
        setClientes(data.clientes || [])
      }
    } catch (error) {
      console.error('Error fetching clientes:', error)
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
        return
      }

      // Agregar el nuevo cliente a la lista
      setClientes([...clientes, data.cliente])
      onChange({ target: { name: 'Nombre de la empresa', value: newCliente.nombre } })
      if (onClienteSelect) {
        onClienteSelect(newCliente)
      }

      // Resetear formulario
      setNewCliente({
        nombre: '',
        telefono: '',
        email: '',
        rfc: '',
        contacto: '',
      })
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
              // Encontrar cliente seleccionado y llenar datos
              const selectedCliente = clientes.find(c => c.nombre === e.target.value)
              if (selectedCliente) {
                onChange({
                  target: { name: 'Nombre de la empresa', value: e.target.value }
                })
                if (onClienteSelect) {
                  onClienteSelect(selectedCliente)
                }
              } else {
                onChange({
                  target: { name: 'Nombre de la empresa', value: e.target.value }
                })
              }
            }}
            className="form-select flex-1"
          >
            <option value="">-- Seleccionar cliente --</option>
            {clientes.map((cliente, idx) => (
              <option key={idx} value={cliente.nombre}>
                {cliente.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm)
              setError('')
            }}
            className="btn btn-secondary"
            title="Registrar nuevo cliente"
          >
            +
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-4 bg-blue-50 border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
          <h3 className="text-sm font-bold mb-3">Registrar Nuevo Cliente</h3>

          {error && (
            <div className="p-2 bg-red-100 border border-red-300 rounded text-sm text-red-700 mb-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <FormField
              label="Nombre de la Empresa *"
              value={newCliente.nombre}
              onChange={(e) => setNewCliente({ ...newCliente, nombre: e.target.value })}
              placeholder="Nombre"
            />
            <FormField
              label="Teléfono"
              value={newCliente.telefono}
              onChange={(e) => setNewCliente({ ...newCliente, telefono: e.target.value })}
              placeholder="9999999999"
            />
            <FormField
              label="Email"
              type="email"
              value={newCliente.email}
              onChange={(e) => setNewCliente({ ...newCliente, email: e.target.value })}
              placeholder="empresa@email.com"
            />
            <FormField
              label="RFC"
              value={newCliente.rfc}
              onChange={(e) => setNewCliente({ ...newCliente, rfc: e.target.value })}
              placeholder="RFC"
            />
            <FormField
              label="Contacto"
              value={newCliente.contacto}
              onChange={(e) => setNewCliente({ ...newCliente, contacto: e.target.value })}
              placeholder="Nombre del contacto"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddCliente}
              disabled={addingCliente}
              className="btn btn-primary flex-1 disabled:opacity-50"
            >
              {addingCliente ? 'Guardando...' : 'Guardar Cliente'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setError('')
                setNewCliente({
                  nombre: '',
                  telefono: '',
                  email: '',
                  rfc: '',
                  contacto: '',
                })
              }}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
