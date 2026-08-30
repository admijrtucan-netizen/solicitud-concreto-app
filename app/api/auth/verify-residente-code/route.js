// Referencia al mismo Map usado en send-residente-code
// En producción, esto estaría en una BD con caducidad automática
const authCodes = new Map()

export async function POST(request) {
  try {
    const { email, folio, authCode } = await request.json()

    if (!email || !folio || !authCode) {
      return Response.json(
        { valid: false, message: 'Email, folio y código requeridos' },
        { status: 400 }
      )
    }

    const key = `${email}:${folio}`
    const storedAuth = authCodes.get(key)

    if (!storedAuth) {
      return Response.json(
        { valid: false, message: 'Código no encontrado. Solicita uno nuevo' },
        { status: 401 }
      )
    }

    // Verificar expiración
    if (Date.now() > storedAuth.expiresAt) {
      authCodes.delete(key)
      return Response.json(
        { valid: false, message: 'Código expirado. Solicita uno nuevo' },
        { status: 401 }
      )
    }

    // Verificar código
    if (storedAuth.code !== authCode) {
      return Response.json(
        { valid: false, message: 'Código incorrecto' },
        { status: 401 }
      )
    }

    // Limpiar código usado
    authCodes.delete(key)

    return Response.json({
      valid: true,
      message: 'Código verificado correctamente',
    })
  } catch (error) {
    console.error('Error en verify-residente-code:', error)
    return Response.json(
      { valid: false, message: 'Error al verificar código' },
      { status: 500 }
    )
  }
}
