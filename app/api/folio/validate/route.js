import { google } from 'googleapis'

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID
const SHEET_NAME = 'BD_SOLICITUD'

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
    const { folio } = await request.json()

    if (!folio) {
      return Response.json(
        { exists: false, message: 'Folio requerido' },
        { status: 400 }
      )
    }

    const { sheets } = await getAuthAndSheets()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!D2:D1000`,
    })

    const values = response.data.values || []
    const folios = values
      .filter(row => row && row[0])
      .map(row => row[0])

    const exists = folios.includes(folio)

    return Response.json({
      exists,
      message: exists ? `El folio ${folio} ya ha sido utilizado` : 'Folio disponible',
    })
  } catch (error) {
    console.error('Error validating folio:', error.message)
    return Response.json(
      { exists: false, message: 'Error al validar folio' },
      { status: 500 }
    )
  }
}
