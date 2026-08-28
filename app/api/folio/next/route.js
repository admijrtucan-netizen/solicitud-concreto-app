import { getAllFolios } from '@/lib/sheets'

export async function GET() {
  try {
    const folios = await getAllFolios()

    // Si no hay folios, devolver el primero
    if (folios.length === 0) {
      return Response.json({ nextNumber: 1 })
    }

    // Extraer números de folios y encontrar el siguiente
    const numbers = folios
      .map(folio => parseInt(folio.replace('INN-', '')))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a)

    const nextNumber = numbers.length > 0 ? numbers[0] + 1 : 1

    return Response.json({ nextNumber })
  } catch (error) {
    console.error('Error fetching next folio:', error)
    return Response.json(
      { error: 'Error fetching next folio' },
      { status: 500 }
    )
  }
}
