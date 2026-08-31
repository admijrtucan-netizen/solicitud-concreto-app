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

export async function GET(request) {
  try {
    const { sheets } = await getAuthAndSheets()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'BD_CLIENTES'!A2:F1000`,
    })

    const values = response.data.values || []
    const clientes = values
      .filter(row => row && row[0] && row[0].trim())
      .map(row => ({
        nombre: row[0]?.trim() || '',
        telefono: row[1]?.trim() || '',
        email: row[2]?.trim() || '',
        rfc: row[3]?.trim() || '',
        contacto: row[4]?.trim() || '',
        fecha: row[5]?.trim() || '',
      }))
      .filter(c => c.nombre)

    console.log('Clientes encontrados:', clientes.length)
    return Response.json({ clientes })
  } catch (error) {
    console.error('Error getting clientes list:', error.message)
    return Response.json({ clientes: [], error: error.message })
  }
}
