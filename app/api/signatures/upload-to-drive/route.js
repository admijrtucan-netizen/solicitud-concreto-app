import { google } from 'googleapis'

const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

let sheetsAPI = null

async function getAuthAndSheets() {
  if (sheetsAPI) return sheetsAPI

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  })

  const sheets = google.sheets({ version: 'v4', auth })
  const drive = google.drive({ version: 'v3', auth })
  sheetsAPI = { auth, sheets, drive }
  return sheetsAPI
}

export async function POST(request) {
  try {
    const { folio, signatureType, signatureBase64, nombreResidente } = await request.json()

    if (!folio || !signatureType || !signatureBase64) {
      return Response.json(
        { error: 'Folio, signatureType y signatureBase64 son requeridos' },
        { status: 400 }
      )
    }

    const { drive } = await getAuthAndSheets()

    // Crear nombre de carpeta principal
    const folderName = `INFORME DE CAMPO DE CONCRETO FRESCO_${folio}`

    // Buscar si la carpeta ya existe
    let folderId = null
    const folderQuery = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      spaces: 'drive',
      fields: 'files(id, name)',
      pageSize: 1,
    })

    if (folderQuery.data.files.length > 0) {
      folderId = folderQuery.data.files[0].id
    } else {
      // Crear carpeta si no existe
      const folderRes = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [GOOGLE_DRIVE_FOLDER_ID],
        },
        fields: 'id',
      })
      folderId = folderRes.data.id
    }

    // Convertir base64 a buffer
    const base64Data = signatureBase64.split(',')[1] || signatureBase64
    const buffer = Buffer.from(base64Data, 'base64')

    // Mapear tipo de firma a nombre de archivo
    const fileNameMap = {
      'Elaboro firma': 'laboratorista.jpg',
      'Solicita firma': 'residente.jpg',
      'Vo. Bo. firma': 'supervisor.jpg',
    }

    const fileName = fileNameMap[signatureType] || `${signatureType}.jpg`

    // Subir firma a Google Drive
    const fileRes = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'image/jpeg',
        parents: [folderId],
      },
      media: {
        mimeType: 'image/jpeg',
        body: buffer,
      },
      fields: 'id, webViewLink',
    })

    return Response.json({
      success: true,
      fileId: fileRes.data.id,
      fileUrl: fileRes.data.webViewLink,
      folderName: folderName,
      fileName: fileName,
    })
  } catch (error) {
    console.error('Error uploading signature:', error)
    return Response.json(
      { error: error.message || 'Error al subir firma' },
      { status: 500 }
    )
  }
}
