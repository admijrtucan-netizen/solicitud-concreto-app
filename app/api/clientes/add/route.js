import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID

let sheetsAPI = null

async function getAuthAndSheets() {
  if (sheetsAPI) return sheetsAPI

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  sheetsAPI = { auth, sheets }
  return sheetsAPI
}

export async function POST(request) {
  try {
    const { nombre, telefono, email, rfc, contacto } = await request.json()

    if (!nombre) {
      return Response.json(
        { success: false, message: 'Nombre de empresa requerido' },
        { status: 400 }
      )
    }

    const { sheets } = await getAuthAndSheets()

    // Obtener el próximo número de fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'BD_CLIENTES'!A:A`,
    })

    const values = response.data.values || []
    const nextRow = values.length + 1

    // Fecha actual en formato DD/MM/YYYY
    const today = new Date()
    const fecha = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`

    // Agregar cliente
    const updates = [
      { range: `'BD_CLIENTES'!A${nextRow}`, values: [[nombre]] },
      { range: `'BD_CLIENTES'!B${nextRow}`, values: [[telefono || '']] },
      { range: `'BD_CLIENTES'!C${nextRow}`, values: [[email || '']] },
      { range: `'BD_CLIENTES'!D${nextRow}`, values: [[rfc || '']] },
      { range: `'BD_CLIENTES'!E${nextRow}`, values: [[contacto || '']] },
      { range: `'BD_CLIENTES'!F${nextRow}`, values: [[fecha]] },
    ]

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        data: updates,
        valueInputOption: 'USER_ENTERED',
      },
    })

    return Response.json({
      success: true,
      message: 'Cliente registrado correctamente',
      cliente: {
        nombre,
        telefono,
        email,
        rfc,
        contacto,
        fecha,
      },
    })
  } catch (error) {
    console.error('Error adding cliente:', error)
    return Response.json(
      { success: false, message: 'Error al registrar cliente' },
      { status: 500 }
    )
  }
}
