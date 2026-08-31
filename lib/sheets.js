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

// Mapeo para SOLICITUD + INFORME
const COLUMN_MAP = {
  // SOLICITUD OFICINA
  'ETAPA': 'A',
  'Fecha de Solicitud': 'B',
  'Fecha de Servicio': 'C',
  'Folio': 'D',
  'Hora de servicio': 'E',
  'Nombre de la empresa': 'F',
  'Tel de la empresa': 'G',
  'Email de la empresa': 'H',
  'RFC de la empresa': 'I',
  'Nombre del Contacto': 'J',
  'Cel del Contacto': 'K',
  'Nombre de la Obra': 'L',
  'Dirección de la obra': 'M',
  'Nombre Residente de obra': 'N',
  'Cel Residente de obra': 'O',
  'Elemento a colar': 'P',
  'Volumen a colar (m³)': 'Q',
  'Planta de premezclado': 'R',
  // SOLICITUD CAMPO
  'Cilindros': 'S',
  'Vigas': 'T',
  'Mortero': 'U',
  'Cantidad de Muestras (1 Muestra = 4 Moldes)': 'V',
  'Edad de ensayo': 'W',
  'Resistencia del Concreto, F\'C (kg/cm²)': 'X',
  'Tipo de Concreto': 'Y',
  'Revenimiento del proyecto (cm)': 'Z',
  'Tamaño Máximo del Agregado (mm)': 'AA',
  'Tiempo de entrega de Resultados': 'AB',
  '¿La empresa realiza el servicio solicitado?': 'AC',
  '¿La prueba solicitada está acreditada?': 'AD',
  '¿Tenemos disponibilidad de personal y equipo para realizar el servicio solicitado en la fecha establecida?': 'AE',
  '¿Se requiere enviar equipo de laboratorio a la obra para realizar pruebas?': 'AF',
  '¿Se acepta realizar el Servicio Solicitado?': 'AG',
  'Persona que tomó los datos': 'AH',
  'Firma': 'AI',
  // INFORME OFICINA
  'FOLIO TUCAN': 'B',
  'No. de Reporte': 'C',
  'Cant. de Muestras Completas': 'D',
  'No. De Cilindros': 'E',
  'No. de Vigas': 'F',
  'Otro': 'G',
  'Llegada personal': 'H',
  'Salida personal': 'I',
  'Método de curado': 'J',
  'Empresa': 'K',
  'Obra': 'L',
  'Resp. de Obra': 'M',
  'Fecha': 'N',
  'Tipo de muestreo': 'O',
  'Muestreo comp/indv': 'P',
  'Tipo de concreto': 'Q',
  'Ubicación': 'R',
  'Elemento': 'S',
  'Proveedor de concreto': 'T',
  // INFORME CAMPO
  'Termómetro TA': 'U',
  'Termómetro T': 'V',
  'Cono No.': 'W',
  'Carretilla No.': 'X',
  'Varilla No.': 'Y',
  'Molde No.': 'Z',
  'Mazo No.': 'AA',
  'Cucharon No.': 'AB',
  'Volumen de esta hoja': 'AC',
  'Volumen total': 'AD',
  'Ensazador No.': 'AE',
  'Felx No.': 'AF',
  'Placa de rev. No.': 'AG',
  'Placa de extensibilidad No.': 'AH',
  'Día 1 Ensayo': 'AI',
  'Día 3 Ensayo': 'AJ',
  'Día 7 Ensayo': 'AK',
  'Día 14 Ensayo': 'AL',
  'Día 28 Ensayo': 'AM',
  'Otro Día Ensayo': 'AN',
  'Elaboró': 'AO',
  'Elaboró firma': 'AP',
  'Solicita': 'AQ',
  'Solicita firma': 'AR',
  'Vo. Bo.': 'AS',
  'Vo. Bo. firma': 'AT',
  'Observaciones': 'AU',
  'Hora de muestreo': 'AV',
  'Cambios': 'AM',
}

// Agregar dinámicamente columnas de muestras (M1-M100)
const MUESTRAS_CAMPOS = [
  'No. Muestra', 'No. Camión', 'No. de Remisión',
  'Salida Planta', 'Llegada a obra', 'Inicio descarga', 'Termina descarga',
  'Volumen (m³)', 'Edad de garantía', "F'c (kg/cm²)", 'TMA (mm)',
  'Extensibilidad/Flujo de Rev. (cm)', 'Revenimiento real (cm)',
  'Extensibilidad/Flujo de Rev. real (cm)', 'Temp Concreto', 'Temp Ambiente (°C)',
  'Humedad (%)', 'Localización', 'Tipo'
]

// Función para convertir número a columna Excel (26 -> Z, 27 -> AA, etc)
function numberToColumn(num) {
  let col = ''
  while (num > 0) {
    num--
    col = String.fromCharCode(65 + (num % 26)) + col
    num = Math.floor(num / 26)
  }
  return col
}

// Generar columnas para M1-M100 (empezando desde columna 49 = AW)
let colNum = 49
for (let m = 1; m <= 100; m++) {
  MUESTRAS_CAMPOS.forEach((campo) => {
    COLUMN_MAP[`M${m} ${campo}`] = numberToColumn(colNum)
    colNum++
  })
}

export async function getAllFolios() {
  try {
    const { sheets } = await getAuthAndSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!D2:D1000`,
    })

    const values = response.data.values || []
    const folios = values
      .filter(row => row && row[0] && row[0].toString().startsWith('INN-'))
      .map(row => row[0])
      .filter(folio => folio && folio.trim() !== '')

    console.log('DEBUG: Folios encontrados:', folios)
    return [...new Set(folios)].sort()
  } catch (error) {
    console.error('Error getting folios:', error.message)
    return []
  }
}

export async function getAllClientes() {
  try {
    const { sheets } = await getAuthAndSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'BD_CLIENTES'!A:F`,
    })

    const values = response.data.values || []
    console.log('DEBUG: Todas las filas de BD_CLIENTES:', values.length, values)

    // Saltar encabezado (fila 1)
    const clientes = values
      .slice(1)
      .filter(row => row && row[0])
      .map(row => ({
        nombre: String(row[0] || '').trim(),
        telefono: String(row[1] || '').trim(),
        email: String(row[2] || '').trim(),
        rfc: String(row[3] || '').trim(),
        contacto: String(row[4] || '').trim(),
        fecha: String(row[5] || '').trim(),
      }))
      .filter(c => c.nombre.length > 0)

    console.log('DEBUG: Clientes procesados:', clientes.length, clientes.map(c => c.nombre))
    return clientes
  } catch (error) {
    console.error('Error getting clientes:', error)
    return []
  }
}

export async function getSolicitudData(folio) {
  try {
    const { sheets } = await getAuthAndSheets()

    // Leer todas las filas y buscar el folio
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:AL1000`,
    })

    const values = response.data.values || []
    console.log(`Buscando folio ${folio} en ${values.length} filas`)

    // Buscar la fila con el folio (D es índice 3)
    const row = values.find(r => r && r[3] === folio)

    if (!row) {
      console.log(`Folio no encontrado: ${folio}`)
      return null
    }

    console.log(`Folio encontrado ${folio}, retornando datos`)
    return {
      'Fecha de Servicio': row[2] || '',
      'Nombre de la empresa': row[5] || '',
      'Dirección de la obra': row[12] || '',
      'Elemento a colar': row[15] || '',
      'Nombre Residente de obra': row[13] || '',
    }
  } catch (error) {
    console.error('Error getting solicitud data:', error.message)
    return null
  }
}

export async function addSolicitudRow(data) {
  try {
    const { sheets } = await getAuthAndSheets()

    // Obtener el próximo número de fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`,
    })

    const values = response.data.values || []
    const nextRow = values.length + 1

    // Construir updates por cada columna
    const updates = []
    Object.keys(data).forEach(key => {
      if (COLUMN_MAP[key]) {
        updates.push({
          range: `${SHEET_NAME}!${COLUMN_MAP[key]}${nextRow}`,
          values: [[data[key] || '']],
        })
      }
    })

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        data: updates,
        valueInputOption: 'USER_ENTERED',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding row:', error.message)
    throw error
  }
}

export async function updateSolicitudRow(folio, data) {
  try {
    const { sheets } = await getAuthAndSheets()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:AL`,
    })

    const values = response.data.values || []
    if (values.length < 2) throw new Error('No data found')

    const folioColIndex = 3 // Columna D
    const rowIndex = values.findIndex((r, idx) => idx > 0 && r[folioColIndex] === folio)

    if (rowIndex === -1) throw new Error(`Folio ${folio} no encontrado`)

    const updates = []
    Object.keys(data).forEach(key => {
      if (COLUMN_MAP[key]) {
        updates.push({
          range: `${SHEET_NAME}!${COLUMN_MAP[key]}${rowIndex + 1}`,
          values: [[data[key] || '']],
        })
      }
    })

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        data: updates,
        valueInputOption: 'USER_ENTERED',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating row:', error.message)
    throw error
  }
}

// Funciones específicas para INFORME DE CAMPO (BD_INFORME)
export async function addInformeRow(data) {
  try {
    const { sheets } = await getAuthAndSheets()
    const INFORME_SHEET = 'BD_INFORME'

    // Obtener el próximo número de fila
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INFORME_SHEET}!A:A`,
    })

    const values = response.data.values || []
    const nextRow = values.length + 1

    // Construir updates por cada columna
    const updates = []
    Object.keys(data).forEach(key => {
      if (COLUMN_MAP[key]) {
        const value = data[key]
        // Si es un objeto (como muestras), convertir a JSON string
        const cellValue = typeof value === 'object' ? JSON.stringify(value) : (value || '')
        updates.push({
          range: `${INFORME_SHEET}!${COLUMN_MAP[key]}${nextRow}`,
          values: [[cellValue]],
        })
      }
    })

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        data: updates,
        valueInputOption: 'USER_ENTERED',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding informe row:', error.message)
    throw error
  }
}

export async function validatePersonalFolio(folio) {
  try {
    const { sheets } = await getAuthAndSheets()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'PERSONAL Y AUTORIZACI'!A2:D100`,
    })

    const values = response.data.values || []
    const row = values.find(r => r && r[0] && r[0].toString() === folio.toString())

    if (!row) {
      return { valid: false, message: 'Folio no encontrado' }
    }

    const nombre = row[1] || ''
    const esLaboratorista = row[2] === true || row[2] === 'TRUE' || row[2] === 'Verdadero'
    const esSupervisor = row[3] === true || row[3] === 'TRUE' || row[3] === 'Verdadero'

    if (!esLaboratorista && !esSupervisor) {
      return { valid: false, message: 'Este folio no tiene permisos de firma' }
    }

    return {
      valid: true,
      nombre,
      esLaboratorista,
      esSupervisor,
    }
  } catch (error) {
    console.error('Error validating personal folio:', error.message)
    return { valid: false, message: 'Error al validar folio' }
  }
}

export async function getResidenteEmail(folio) {
  try {
    const { sheets } = await getAuthAndSheets()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:H1000`,
    })

    const values = response.data.values || []
    const row = values.find(r => r && r[3] === folio)

    if (!row) return null

    return {
      residente: row[13] || '',
      email: row[7] || '',
      telefono: row[14] || '',
    }
  } catch (error) {
    console.error('Error getting residente email:', error.message)
    return null
  }
}

export async function updateInformeRow(folioTucan, data) {
  try {
    const { sheets } = await getAuthAndSheets()
    const INFORME_SHEET = 'BD_INFORME'

    // Buscar fila por FOLIO TUCAN (columna B)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INFORME_SHEET}!B:B`,
    })

    const folioCol = response.data.values || []
    const rowIndex = folioCol.findIndex(r => r && r[0] === folioTucan)

    if (rowIndex === -1) {
      console.log('FOLIO TUCAN no encontrado:', folioTucan)
      // Si no existe, crear nuevo
      return addInformeRow(data)
    }

    const updates = []
    Object.keys(data).forEach(key => {
      if (COLUMN_MAP[key]) {
        const value = data[key]
        const cellValue = typeof value === 'object' ? JSON.stringify(value) : (value || '')
        updates.push({
          range: `${INFORME_SHEET}!${COLUMN_MAP[key]}${rowIndex + 1}`,
          values: [[cellValue]],
        })
      }
    })

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        data: updates,
        valueInputOption: 'USER_ENTERED',
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating informe row:', error.message)
    throw error
  }
}
