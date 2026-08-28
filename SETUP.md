# Sistema de Solicitudes y Reportes - Concreto Fresco

## Estructura del Proyecto

```
solicitud-concreto-app/
├── app/                          # Rutas y layout de Next.js
│   ├── api/                       # API routes
│   │   ├── folio/next/           # Obtener próximo folio
│   │   └── solicitud/            # CRUD de solicitudes
│   ├── solicitud/                # Página de SOLICITUD DE SERVICIO
│   ├── informe/                  # Página de INFORME DE CAMPO (próximo)
│   ├── layout.js                 # Layout global
│   ├── page.js                   # Página de inicio (seleccionar tipo)
│   └── globals.css               # Estilos globales (Tailwind)
├── components/                    # Componentes reutilizables
│   ├── FormField.js              # Input genérico
│   └── SignaturePad.js           # Canvas para firmas
├── lib/                          # Funciones de negocio
│   └── sheets.js                 # Google Sheets API
└── package.json
```

## Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Google Sheets API:**
   - Ir a [Google Cloud Console](https://console.cloud.google.com)
   - Crear un proyecto
   - Habilitar "Google Sheets API"
   - Crear una Service Account
   - Descargar la clave JSON
   - Copiar `.env.local.example` a `.env.local`
   - Llenar las variables con tus credenciales

3. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```
   Abrir http://localhost:3000

## Configuración de Google Sheets

### Credenciales necesarias:

1. **Spreadsheet ID:** 
   - URL: `https://docs.google.com/spreadsheets/d/{ID}/edit`
   - Copiar el ID entre `/d/` y `/edit`

2. **Service Account:**
   - Google Cloud Console → IAM y administración → Service Accounts
   - Crear cuenta de servicio
   - Crear clave (JSON)
   - Compartir Sheet con el email: `[service-account]@[project].iam.gserviceaccount.com`

3. **Variables en .env.local:**
   ```
   NEXT_PUBLIC_GOOGLE_SHEETS_ID=1xDMdSaO5-frRIAhnC8dZYbHKKrl5KHYo8Fg3mHbeSrY
   GOOGLE_SERVICE_ACCOUNT_EMAIL=tucan@proyecto.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## Estructura de Google Sheets

El Sheet actual debe tener estas hojas:
- **Solicitud** - Datos de solicitudes (columnas a-al)
- **Informe** - Datos de campo (próximo)

**Nota:** Las primeras 3 letras (a, b, c) en el Sheet deben corresponder exactamente a los nombres de columna en la aplicación.

## Flujo de Usuario

### 1. SOLICITUD DE SERVICIO DE CONCRETO
   - **Rol:** Oficina
   - **Pasos:**
     - Llenar datos de cliente, obra, contacto
     - Datos técnicos (elemento, volumen, etc)
     - 5 preguntas de validación (SI/NO)
     - Sistema sugiere folio (INN-00001)
     - Guardar en Sheet
   - **Status:** EN PROCESO

### 2. INFORME DE CAMPO DE CONCRETO FRESCO
   - **Rol:** Campo
   - **Pasos:**
     - Buscar folio (desplegable)
     - Verificar: Fecha, Cliente, Dirección, Elemento, Residente
     - Llenar datos de campo (muestras, F'C, tipo concreto, etc)
     - Firma digital (canvas)
     - Actualizar en mismo registro de Sheet
   - **Status:** LISTO

### 3. Revisar & Aprobar
   - Ver previa de PDF
   - Editar si hay cambios
   - Confirmar
   - Trigger webhook n8n → PDF + Email

## Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build para producción
npm start        # Ejecutar producción
npm run lint     # Linter
```

## Despliegue en Vercel

1. Conectar repo a Vercel
2. Agregar variables de entorno en Vercel Settings
3. Deploy automático

## Próximos pasos

- [ ] Crear página de INFORME DE CAMPO DE CONCRETO FRESCO
- [ ] Integrar Google Drive API para subir firmas
- [ ] Crear componente de previa PDF
- [ ] Webhook n8n
- [ ] Tests

## Notas importantes

- **No modificar Formidable actual** - Esta es una copia de trabajo
- **Sheets es la BD principal** - Vercel solo hospeda frontend
- **Firmas digitales:** Se guardan como PNG en Google Drive
- **Folio es PK:** Vincula Solicitud + Informe
