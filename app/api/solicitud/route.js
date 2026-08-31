import { addSolicitudRow, updateSolicitudRow, getSolicitudData, addInformeRow, updateInformeRow } from '@/lib/sheets'

export async function POST(request) {
  try {
    const data = await request.json()

    // Detectar si es INFORME (tiene 'muestras') o SOLICITUD (tiene 'Folio')
    const isInforme = data.muestras !== undefined

    if (isInforme) {
      // INFORME DE CAMPO - usa FOLIO TUCAN o crea uno nuevo
      const folioTucan = data['FOLIO TUCAN'] || `INFORME-${Date.now()}`

      // Agregar o actualizar en BD_INFORME
      await updateInformeRow(folioTucan, {
        ...data,
        'FOLIO TUCAN': folioTucan,
      })

      return Response.json({
        success: true,
        message: 'Informe de Campo guardado',
        folioTucan,
      })
    } else {
      // SOLICITUD DE SERVICIO - usa Folio original
      if (!data.Folio) {
        return Response.json(
          { error: 'Folio es requerido' },
          { status: 400 }
        )
      }

      // Verificar si el folio ya existe
      const existingData = await getSolicitudData(data.Folio)

      if (existingData) {
        // Si existe, verificar si hay cambios
        let hayChangios = false
        const CAMPOS_COMPARABLES = [
          'Fecha de Solicitud', 'Fecha de Servicio', 'Hora de servicio',
          'Nombre de la empresa', 'Tel de la empresa', 'Email de la empresa',
          'RFC de la empresa', 'Nombre del Contacto', 'Cel del Contacto',
          'Nombre de la Obra', 'Dirección de la obra',
          'Nombre Residente de obra', 'Cel Residente de obra',
          'Elemento a colar', 'Volumen a colar (m³)', 'Planta de premezclado',
          'Cilindros', 'Vigas', 'Mortero',
          'Cantidad de Muestras (1 Muestra = 4 Moldes)',
          'Edad de ensayo', 'Resistencia del Concreto, F\'C (kg/cm²)',
          'Tipo de Concreto', 'Revenimiento del proyecto (cm)',
          'Tamaño Máximo del Agregado (mm)',
        ]

        for (const campo of CAMPOS_COMPARABLES) {
          if (data[campo] && data[campo] !== existingData[campo]) {
            hayChangios = true
            break
          }
        }

        // Si hay cambios, marcar como PENDIENTE NUEVA FIRMA
        if (hayChangios) {
          data['Cambios'] = 'PENDIENTE NUEVA FIRMA'
          data['ETAPA'] = 'EN PROCESO'
        }

        // Actualizar
        await updateSolicitudRow(data.Folio, data)
      } else {
        // Si no existe, crear nuevo
        await addSolicitudRow(data)
      }

      return Response.json({
        success: true,
        message: existingData ? (hayChangios ? 'Cambios guardados - PENDIENTE FIRMA' : 'Registro actualizado') : 'Solicitud guardada',
        folio: data.Folio,
      })
    }
  } catch (error) {
    console.error('Error saving:', error)
    return Response.json(
      { error: error.message || 'Error al guardar' },
      { status: 500 }
    )
  }
}
