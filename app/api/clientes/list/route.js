import { getAllClientes } from '@/lib/sheets'

export async function GET() {
  try {
    const clientes = await getAllClientes()
    return Response.json({
      clientes,
      count: clientes.length,
    })
  } catch (error) {
    console.error('Error fetching clientes list:', error.message)
    return Response.json(
      { error: 'Error fetching clientes', clientes: [] },
      { status: 500 }
    )
  }
}
