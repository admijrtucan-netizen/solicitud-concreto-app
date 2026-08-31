'use client'

import { useState } from 'react'
import FormField from '@/components/FormField'

export default function MuestraRevendimiento({
  index,
  data,
  onChange,
  onRemove,
  isLast
}) {
  const [tipo, setTipo] = useState(data?.tipo || 'MUESTRA')

  const handleTipoChange = (newTipo) => {
    setTipo(newTipo)
    onChange(index, { ...data, tipo: newTipo })
  }

  const handleChange = (field, value) => {
    onChange(index, { ...data, [field]: value, tipo })
  }

  const campos_comunes = [
    { name: 'No. Muestra', key: 'noMuestra' },
    { name: 'No. Camión', key: 'noCamion' },
    { name: 'No. de Remisión', key: 'noRemision' },
    { name: 'Salida Planta', key: 'salidaPlanta', type: 'time' },
    { name: 'Llegada a obra', key: 'llegadaObra', type: 'time' },
    { name: 'Inicio descarga', key: 'inicioDescarga', type: 'time' },
    { name: 'Termina descarga', key: 'terminaDescarga', type: 'time' },
    { name: 'Volumen (m³)', key: 'volumen', type: 'number' },
  ]

  const campos_muestra = [
    { name: 'F\'c (kg/cm²)', key: 'fc', type: 'number' },
    { name: 'TMA (mm)', key: 'tma', type: 'number' },
    { name: 'Revenimiento real (cm)', key: 'revenimientoReal', type: 'number' },
  ]

  const campos_revendimiento = [
    { name: 'Edad de garantía', key: 'edadGarantia' },
    { name: 'Extensibilidad/Flujo de Rev. (cm)', key: 'extensibilidad', type: 'number', optional: true },
    { name: 'Extensibilidad/Flujo de Rev. real (cm)', key: 'extensibilidadReal', type: 'number', optional: true },
    { name: 'Temp. Concreto (°C)', key: 'tempConcretoValue', type: 'number' },
    { name: 'Temp. Ambiente (°C)', key: 'tempAmbienteValue', type: 'number' },
  ]

  const campos_temperatura_dropdown = [
    { label: 'Termómetro Seco (TD)', value: 'TD' },
    { label: 'Termómetro Bulbo Húmedo (TB)', value: 'TB' },
  ]

  return (
    <div className="mt-8 pt-8 border-t-2 border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Registro {index + 1}</h3>
        {isLast && index > 0 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Eliminar
          </button>
        )}
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
        <label className="block text-sm font-semibold mb-3 text-gray-700">Tipo de registro *</label>
        <div className="flex gap-4">
          {['MUESTRA', 'REVENDIMIENTO'].map(t => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`tipo-${index}`}
                value={t}
                checked={tipo === t}
                onChange={() => handleTipoChange(t)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {campos_comunes.map(campo => (
          <FormField
            key={campo.key}
            label={campo.name}
            type={campo.type || 'text'}
            value={data?.[campo.key] || ''}
            onChange={(e) => handleChange(campo.key, e.target.value)}
          />
        ))}
      </div>

      {tipo === 'MUESTRA' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h4 className="col-span-2 font-semibold text-blue-900 mb-2">Datos de Muestra</h4>
          {campos_muestra.map(campo => (
            <FormField
              key={campo.key}
              label={campo.name}
              type={campo.type || 'text'}
              value={data?.[campo.key] || ''}
              onChange={(e) => handleChange(campo.key, e.target.value)}
            />
          ))}
        </div>
      )}

      {tipo === 'REVENDIMIENTO' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded border border-green-200">
            <h4 className="col-span-2 font-semibold text-green-900 mb-2">Datos de Revendimiento</h4>
            {campos_revendimiento.map(campo => (
              <FormField
                key={campo.key}
                label={campo.name + (campo.optional ? ' (opcional)' : '')}
                type={campo.type || 'text'}
                value={data?.[campo.key] || ''}
                onChange={(e) => handleChange(campo.key, e.target.value)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 rounded border border-yellow-200">
            <h4 className="col-span-2 font-semibold text-yellow-900 mb-2">Tipo de Termómetro</h4>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Termómetro para Temp. Concreto *
              </label>
              <select
                value={data?.termoConcretoTipo || 'TD'}
                onChange={(e) => handleChange('termoConcretoTipo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                style={{ borderColor: '#d1d5db' }}
              >
                {campos_temperatura_dropdown.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Termómetro para Temp. Ambiente *
              </label>
              <select
                value={data?.termoAmbienteTipo || 'TD'}
                onChange={(e) => handleChange('termoAmbienteTipo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                style={{ borderColor: '#d1d5db' }}
              >
                {campos_temperatura_dropdown.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
