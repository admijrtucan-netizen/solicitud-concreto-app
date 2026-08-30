import { getResidenteEmail } from '@/lib/sheets'

// Almacenar códigos generados en memoria (en producción usar una BD)
const authCodes = new Map()

export async function POST(request) {
  try {
    const { email, folio } = await request.json()

    if (!email || !folio) {
      return Response.json(
        { success: false, message: 'Email y folio requeridos' },
        { status: 400 }
      )
    }

    // Obtener datos del residente
    const residenteData = await getResidenteEmail(folio)

    if (!residenteData) {
      return Response.json(
        { success: false, message: 'Folio no encontrado' },
        { status: 404 }
      )
    }

    // Generar código de 6 dígitos
    const authCode = Math.random().toString().slice(2, 8).padStart(6, '0')

    // Almacenar código con expiración (5 minutos)
    authCodes.set(`${email}:${folio}`, {
      code: authCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
    })

    // Enviar código por email vía n8n
    try {
      const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/send-auth-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nombre: residenteData.residente,
          folio,
          authCode,
          telefono: residenteData.telefono,
        }),
      })

      if (!n8nResponse.ok) {
        console.warn('n8n webhook response:', n8nResponse.status)
      }
    } catch (n8nError) {
      console.warn('n8n integration note:', n8nError.message)
      // Continuar incluso si n8n falla - el código se generó localmente
    }

    return Response.json({
      success: true,
      nombre: residenteData.residente,
      message: `Código enviado a ${email}`,
    })
  } catch (error) {
    console.error('Error en send-residente-code:', error)
    return Response.json(
      { success: false, message: 'Error al enviar código' },
      { status: 500 }
    )
  }
}
