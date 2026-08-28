import { getAllFolios } from '@/lib/sheets'

export async function GET() {
  try {
    const folios = await getAllFolios()

    return Response.json({
      folios: folios,
      count: folios.length,
    })
  } catch (error) {
    console.error('Error fetching all folios:', error)
    return Response.json(
      { error: 'Error fetching folios', folios: [] },
      { status: 500 }
    )
  }
}
