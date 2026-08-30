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
      range: `'PERSONAL Y AUTORIZACI'!A2:D100`,
    })

    const values = response.data.values || []
    const personal = values
      .filter(row => row && row[0] && row[1])
      .map(row => ({
        folio: row[0],
        nombre: row[1],
        esLaboratorista: row[2] === true || row[2] === 'TRUE' || row[2] === 'Verdadero',
        esSupervisor: row[3] === true || row[3] === 'TRUE' || row[3] === 'Verdadero',
      }))
      .filter(p => p.esLaboratorista || p.esSupervisor)

    return Response.json({ personal })
  } catch (error) {
    console.error('Error getting personal list:', error.message)
    return Response.json({ personal: [] })
  }
}
