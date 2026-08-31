# Integración Sheets + n8n para PDFs No Modificables

## Descripción
Las URLs de firmas se guardan en Google Sheets y se usan en plantillas de n8n para generar PDFs no modificables.

## URLs de Firmas en Sheets

Después de guardar el Informe de Campo, las URLs de firmas se almacenan en Sheets:

| Columna | Valor | Ejemplo |
|---------|-------|---------|
| Elaboro firma (AP) | URL de Drive | `https://drive.google.com/file/d/1abc123xyz/view` |
| Solicita firma (AR) | URL de Drive | `https://drive.google.com/file/d/1def456uvw/view` |
| Vo. Bo. firma (AT) | URL de Drive | `https://drive.google.com/file/d/1ghi789rst/view` |

## Flujo Completo de Guardado

### 1. Captura de Firma (App)
```
Usuario dibuja firma en canvas
↓
Se convierte a JPEG base64
↓
Se envía a API /api/signatures/upload-to-drive
```

### 2. Subida a Google Drive (API)
```
API recibe base64
↓
Verifica/crea carpeta: INFORME DE CAMPO DE CONCRETO FRESCO_827349
↓
Sube archivo con nombre automático:
  - laboratorista.jpg
  - residente.jpg
  - supervisor.jpg
↓
Retorna URL de Drive
```

### 3. Guardado en Sheets (App)
```
URL de Drive llega desde API
↓
Se guarda en columna correspondiente:
  - Elaboro firma → AP
  - Solicita firma → AR
  - Vo. Bo. firma → AT
↓
Otras columnas también se guardan (folio, datos, etc.)
```

## Usar URLs en n8n para PDFs

### Paso 1: Leer de Google Sheets
En n8n, usar trigger "Google Sheets" para leer nuevas filas:
```
Spreadsheet: TU_SPREADSHEET_ID
Range: BD_INFORME!A:AT
```

### Paso 2: Descargar Imágenes de Drive
Para cada fila, descargar las 3 firmas:

```javascript
// En Google Drive - Download File
// Para Elaboro firma (AP)
File ID: {{$node["Read from Sheets"].json.body[44]}}
// Extraer file ID de la URL:
// https://drive.google.com/file/d/1abc123xyz/view
// File ID = 1abc123xyz
```

**Forma automática de extraer File ID de URL:**
```javascript
{{$node["Read from Sheets"].json.body[44].split('/d/')[1].split('/')[0]}}
```

### Paso 3: Crear Plantilla PDF en n8n

**Opción A: PDF Generador (si disponible)**
```
Usar Handlebars o Markdown para insertar imágenes:
<img src="{{ $response.download.url }}" />
```

**Opción B: HTML a PDF**
```html
<div class="signature-block">
  <img src="{{ $node.Download1.json.url }}" 
       style="max-width: 200px; height: auto;" />
  <p>Laboratorista: {{ row.Elaboro }}</p>
  <p>Fecha: {{ row["Fecha de Solicitud"] }}</p>
</div>
```

### Paso 4: Generar PDF No Modificable

Usar nodo "PDF" o "HTML to PDF":
- Entrada: HTML con imágenes
- Salida: PDF protegido
- Protección: Contraseña o solo lectura

## Ejemplo de Plantilla n8n

### Workflow Completo

```
1. Google Sheets Trigger
   ├─ Evento: Cuando se inserta fila
   ├─ Rango: BD_INFORME!A:AT
   └─ Retorna: {{$node.trigger.json.body}}

2. JavaScript - Extraer File IDs
   ├─ Elaboro_FileID = 
   │  {{$node.trigger.json.body[44].split('/d/')[1].split('/')[0]}}
   ├─ Solicita_FileID = 
   │  {{$node.trigger.json.body[46].split('/d/')[1].split('/')[0]}}
   └─ VoBo_FileID = 
      {{$node.trigger.json.body[48].split('/d/')[1].split('/')[0]}}

3. Google Drive - Download File (Laboratorista)
   ├─ Folder ID: 1KeYg_Y0vBWuyDA7Q1nrs8lNcMM9pTQVC
   └─ File ID: {{$json.Elaboro_FileID}}

4. Google Drive - Download File (Residente)
   ├─ Folder ID: 1KeYg_Y0vBWuyDA7Q1nrs8lNcMM9pTQVC
   └─ File ID: {{$json.Solicita_FileID}}

5. Google Drive - Download File (Supervisor)
   ├─ Folder ID: 1KeYg_Y0vBWuyDA7Q1nrs8lNcMM9pTQVC
   └─ File ID: {{$json.VoBo_FileID}}

6. HTML to PDF
   └─ Entrada: Plantilla con referencias a imágenes descargadas

7. Google Drive - Upload File
   ├─ Folder: INFORME DE CAMPO DE CONCRETO FRESCO_{{folio}}
   ├─ Nombre: INFORME_FINAL_{{folio}}.pdf
   └─ Contenido: PDF generado
```

## Estructura de Datos en Sheets

**Row 1 (Headers):**
```
A:ETAPA | B:Fecha Solicitud | ... | AP:Elaboro firma | AR:Solicita firma | AT:Vo. Bo. firma | ...
```

**Row 2+ (Datos):**
```
LISTO | 2026-08-30 | ... | https://drive.google.com/file/d/1abc.../view | https://... | https://... | ...
```

## URLs Completas en Sheets

Las URLs guardadas son públicamente accesibles (si Drive está configurado así):
```
https://drive.google.com/file/d/1abc123xyz/view
https://drive.google.com/file/d/1def456uvw/view
https://drive.google.com/file/d/1ghi789rst/view
```

n8n puede:
✓ Descargar directamente desde URL
✓ Insertar en HTML/PDF
✓ Hacer referencia en plantillas
✓ Crear QR de URL
✓ Compartir enlace de forma controlada

## Seguridad

- ✅ URLs tienen permisos de Drive (compartidas específicamente)
- ✅ PDFs son no modificables (protección n8n)
- ✅ Auditoría completa en Sheets (quién, cuándo)
- ✅ Firmas almacenadas en Drive (respaldo)
- ✅ Copias firmadas en PDF

## Troubleshooting

### Las URLs no se cargan en n8n
- Verificar que las URLs sean accesibles (permisos públicos)
- Verificar formato de URL: debe tener `/d/` y file ID

### PDF genera pero sin imágenes
- Descargar imágenes primero antes de insertar en HTML
- Convertir a base64 si n8n no soporta URLs directas

### File ID no se extrae correctamente
Usar esta fórmula mejorada:
```javascript
{{($node.trigger.json.body[44].match(/\/d\/([a-zA-Z0-9-_]+)/)||[])[1]}}
```

## Campos Útiles para Plantilla PDF

```javascript
// De Sheets hacia n8n
folio: {{row.D}}                    // FOLIO TUCAN
nombreEmpresa: {{row.K}}            // Empresa
obra: {{row.L}}                     // Obra
residente: {{row.M}}                // Resp. de Obra
fechaServicio: {{row.C}}            // Fecha
elaboroFirmaURL: {{row.AP}}         // Elaboro firma
solicitaFirmaURL: {{row.AR}}        // Solicita firma
voBoBirmaURL: {{row.AT}}            // Vo. Bo. firma
```

## Conclusión

El flujo completo es:
1. ✅ App captura firma → sube a Drive → devuelve URL
2. ✅ App guarda URL en Sheets
3. ✅ n8n lee Sheets → descarga imágenes → genera PDF
4. ✅ PDF no modificable listo para residente/cliente
