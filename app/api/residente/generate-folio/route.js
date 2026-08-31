// Se usa getAuthAndSheets centralizada de lib/sheets.js
// Los folios se almacenan localmente en memoria o en la variable de caché

// Generar folio único aleatorio de 6 dígitos
function generateUniqueFolio() {
  return Math.floor(Math.random() * 999999).toString().padStart(6, '0')
}

export async function POST(request) {
  try {
    const { nombreResidente, emailResidente, solicitudFolio } = await request.json()

    if (!nombreResidente || !emailResidente) {
      return Response.json(
        { error: 'Nombre y email del residente son requeridos' },
        { status: 400 }
      )
    }

    // Generar folio único
    const folioResidente = generateUniqueFolio()

    // Enviar al webhook de n8n
    const webhookUrl = process.env.N8N_RESIDENTE_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombreResidente,
            emailResidente,
            folioResidente,
            solicitudFolio,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (webhookError) {
        console.error('Error enviando a webhook n8n:', webhookError)
        // No fallar si el webhook falla, pero registrar el error
      }
    }

    return Response.json({
      success: true,
      folioResidente,
      message: `Folio enviado a ${emailResidente}`,
    })
  } catch (error) {
    console.error('Error generating folio:', error)
    return Response.json(
      { error: error.message || 'Error al generar folio' },
      { status: 500 }
    )
  }
}
