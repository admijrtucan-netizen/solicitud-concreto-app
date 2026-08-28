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
        // Si existe, actualizar
        await updateSolicitudRow(data.Folio, data)
      } else {
        // Si no existe, crear nuevo
        await addSolicitudRow(data)
      }

      return Response.json({
        success: true,
        message: existingData ? 'Registro actualizado' : 'Solicitud guardada',
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
