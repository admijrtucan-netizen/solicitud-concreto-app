import { validatePersonalFolio } from '@/lib/sheets'

export async function POST(request) {
  try {
    const { folio, role } = await request.json()

    if (!folio) {
      return Response.json(
        { valid: false, message: 'Folio requerido' },
        { status: 400 }
      )
    }

    const result = await validatePersonalFolio(folio)

    if (!result.valid) {
      return Response.json(result, { status: 401 })
    }

    // Verificar permisos según el rol
    if (role === 'laboratorista' && !result.esLaboratorista) {
      return Response.json(
        { valid: false, message: 'Este folio no tiene permisos de laboratorista' },
        { status: 403 }
      )
    }

    if (role === 'supervisor' && !result.esSupervisor) {
      return Response.json(
        { valid: false, message: 'Este folio no tiene permisos de supervisor' },
        { status: 403 }
      )
    }

    return Response.json({
      valid: true,
      nombre: result.nombre,
      esLaboratorista: result.esLaboratorista,
      esSupervisor: result.esSupervisor,
    })
  } catch (error) {
    console.error('Error en validate-folio:', error)
    return Response.json(
      { valid: false, message: 'Error al validar folio' },
      { status: 500 }
    )
  }
}
