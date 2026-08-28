import { getSolicitudData } from '@/lib/sheets'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const folio = searchParams.get('folio')

    if (!folio) {
      return Response.json(
        { error: 'Folio es requerido' },
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
    console.error('Error fetching solicitud data:', error)
    return Response.json(
      { error: 'Error fetching data' },
      { status: 500 }
    )
  }
}
