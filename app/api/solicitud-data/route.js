import { getSolicitudData } from '@/lib/sheets'

export async function POST(request) {
  try {
    const { folio } = await request.json()

    if (!folio) {
      return Response.json(
        { error: 'Folio requerido' },
        { status: 400 }
      )
    }

    const data = await getSolicitudData(folio)

    if (!data) {
      return Response.json(
        { error: 'Folio no encontrado' },
        { status: 404 }
      )
    }

    return Response.json(data)
  } catch (error) {
    console.error('Error getting solicitud data:', error)
    return Response.json(
      { error: error.message || 'Error al obtener datos' },
      { status: 500 }
    )
  }
}
