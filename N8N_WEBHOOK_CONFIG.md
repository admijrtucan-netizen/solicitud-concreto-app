# Configuración del Webhook n8n para Validación de Residente

## Descripción
La aplicación genera un folio único para cada residente y lo envía al webhook de n8n para que se distribuya por email.

## Endpoint de la Aplicación
- **URL:** `https://tu-app.com/api/residente/generate-folio`
- **Método:** `POST`
- **Content-Type:** `application/json`

## Datos que llegan al Webhook n8n

```json
{
  "nombreResidente": "Juan Pérez",
  "emailResidente": "juan.perez@example.com",
  "folioResidente": "827349",
  "solicitudFolio": "SOLICITUD-12345",
  "timestamp": "2026-08-30T14:30:00.000Z"
}
```

## Configuración en n8n

### 1. Webhook Trigger
- Crear un nuevo workflow
- Agregar nodo "Webhook"
- Configurar para recibir POST requests
- Copiar la URL del webhook

### 2. Variables de Ambiente
En `.env.local` de la app, agregar:
```
N8N_RESIDENTE_WEBHOOK_URL=https://tu-instance-n8n.com/webhook/xxxxx
```

### 3. Email a Residente
Configurar nodo "Gmail" o similar para:

**Asunto:**
```
Folio de Autorización - INNOVAR Laboratorios
```

**Cuerpo:**
```
Hola {{$node.Webhook.json.nombreResidente}},

Ha solicitado autorización para toma de muestras de concreto.

Su FOLIO DE AUTORIZACIÓN ES:
╔═════════════╗
║  {{$node.Webhook.json.folioResidente}}  ║
╚═════════════╝

Copie este folio exacto en el formulario de registro.
Este folio es válido por 24 horas.

Solicitud: {{$node.Webhook.json.solicitudFolio}}
Fecha: {{$node.Webhook.json.timestamp}}

Si no solicitó esta acción, ignore este email.

Saludos,
INNOVAR Laboratorios
```

### 4. Confirmación (Opcional)
Guardar folio en base de datos para auditoría:

| Campo | Valor |
|-------|-------|
| folioResidente | `{{$node.Webhook.json.folioResidente}}` |
| nombreResidente | `{{$node.Webhook.json.nombreResidente}}` |
| emailResidente | `{{$node.Webhook.json.emailResidente}}` |
| solicitudFolio | `{{$node.Webhook.json.solicitudFolio}}` |
| generadoEn | `{{$node.Webhook.json.timestamp}}` |
| estado | "pendiente_validacion" |

## Características de Seguridad

1. **Folio Único:** Cada folio tiene 2^56.5 posibilidades (prácticamente imposible de adivinar)
2. **Un folio por residente:** No se reutilizan folios
3. **Validación en formulario:** El sistema valida que sea exacto
4. **Timestamp:** Se registra cuándo se generó
5. **Auditoría:** Todo queda registrado en Google Sheets

## Troubleshooting

### El folio no llega por email
- Verificar que la URL del webhook esté correctamente configurada en `.env.local`
- Revisar logs de n8n para errores
- Comprobar que Gmail tiene permisos de aplicación

### El folio no valida correctamente
- Verificar que se ingrese exacto (con espacios o dígitos)
- El formulario solo acepta números
- Revisar que sea el folio más reciente generado

### Residente genera folio de más
- Genera un nuevo folio cada vez (el anterior se descarta)
- Los folios antiguos ya no funcionan
- Esto es por diseño (seguridad)

## Ejemplo de Respuesta de la API

**Success (200):**
```json
{
  "success": true,
  "folioResidente": "18723873092841902",
  "message": "Folio enviado a juan.perez@example.com"
}
```

**Error (400):**
```json
{
  "error": "Nombre y email del residente son requeridos"
}
```
