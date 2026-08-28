# Estructura del Proyecto - Solicitud Concreto App

```
solicitud-concreto-app/
│
├── app/
│   ├── api/
│   │   ├── folio/
│   │   │   └── next/
│   │   │       └── route.js              # GET próximo folio
│   │   ├── solicitud/
│   │   │   └── route.js                  # POST solicitud (guardar)
│   │   └── informe/                      # (próximo)
│   │
│   ├── solicitud/
│   │   └── page.js                       # Formulario SOLICITUD (Paso 1-2)
│   │
│   ├── informe/
│   │   └── page.js                       # Formulario INFORME (próximo)
│   │
│   ├── layout.js                         # HTML raíz + nav
│   ├── page.js                           # Página principal (botones tipo)
│   └── globals.css                       # Tailwind + estilos generales
│
├── components/
│   ├── FormField.js                      # Input genérico (text, date, time, select, checkbox)
│   ├── SignaturePad.js                   # Canvas para firmas digitales
│   └── Preview.js                        # (próximo) - Previa de PDF
│
├── lib/
│   └── sheets.js                         # Google Sheets API (CRUD)
│
├── public/                               # (opcional) Assets estáticos
│
├── .env.local.example                    # Variables de ejemplo
├── .gitignore
├── next.config.js                        # Configuración Next.js
├── package.json
├── postcss.config.js                     # PostCSS + Tailwind
├── tailwind.config.js                    # Config Tailwind
├── tsconfig.json                         # TypeScript (opcional)
├── SETUP.md                              # Instrucciones instalación
└── ESTRUCTURA.md                         # Este archivo
```

## Explicación de carpetas clave

### `/app`
- **Next.js App Router** - Todas las rutas y páginas
- **`page.js`** en cada carpeta = ruta
- **`api/`** = API routes (serverless functions)

### `/components`
- Componentes React reutilizables
- `FormField` = input con validación
- `SignaturePad` = canvas para firmas

### `/lib`
- Lógica de negocio (no componentes)
- `sheets.js` = funciones para leer/escribir en Google Sheets

## Flujo de archivos

```
Usuario llega a /
  └─ app/page.js
     ├─ Botón: SOLICITUD → app/solicitud/page.js
     └─ Botón: INFORME → app/informe/page.js

app/solicitud/page.js
  ├─ Usa: <FormField /> de components/FormField.js
  ├─ Usa: <SignaturePad /> de components/SignaturePad.js
  ├─ GET /api/folio/next → obtiene próximo folio
  └─ POST /api/solicitud → guarda en Sheets

app/api/folio/next/route.js
  └─ lib/sheets.js → getNextFolioNumber()

app/api/solicitud/route.js
  └─ lib/sheets.js → addSolicitud(data)

lib/sheets.js
  └─ Google Sheets API → GoogleSpreadsheet library
```

## Cómo agregar nuevas funciones

### Agregar nuevo campo en formulario:
1. Agregar en estado `formData` de `page.js`
2. Agregar `<FormField>` en JSX
3. Validación en `validateStep1()`

### Agregar nueva API:
1. Crear carpeta en `app/api/[nombre]/[acción]/`
2. Crear `route.js`
3. Exportar función `GET`, `POST`, etc

### Agregar nuevo componente:
1. Crear archivo en `components/[NombreComponente].js`
2. Usar en página: `import NombreComponente from '@/components/NombreComponente'`

## Variables de entorno (.env.local)

```
# Google Sheets
NEXT_PUBLIC_GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# Google Drive (para firmas)
NEXT_PUBLIC_GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_DRIVE_API_KEY=

# n8n (para webhook)
NEXT_PUBLIC_N8N_WEBHOOK_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nota:** Variables con `NEXT_PUBLIC_` se exponen al frontend (no secrets)
