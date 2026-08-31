# Almacenamiento de Firmas en Google Drive

## Descripción
Las firmas digitales se capturan en el formulario INFORME CAMPO y se suben automáticamente a Google Drive en una estructura organizada por folio.

## Estructura de Carpetas

```
📁 1KeYg_Y0vBWuyDA7Q1nrs8lNcMM9pTQVC (Carpeta principal)
└── 📁 INFORME DE CAMPO DE CONCRETO FRESCO_827349 (Folio)
    ├── 📄 laboratorista.jpg (Firma del laboratorista)
    ├── 📄 residente.jpg (Firma del residente)
    └── 📄 supervisor.jpg (Firma del supervisor)
```

## Flujo de Guardado

1. **Captura de Firma**
   - Usuario firma en canvas (SignaturePad)
   - Se convierte a imagen JPEG en base64
   - Click en "Guardar Firma"

2. **Subida a Drive**
   - API POST: `/api/signatures/upload-to-drive`
   - Envía:
     ```json
     {
       "folio": "827349",
       "signatureType": "Solicita firma",
       "signatureBase64": "data:image/jpeg;base64,/9j/...",
       "nombreResidente": "Juan Pérez"
     }
     ```

3. **Creación de Estructura**
   - Verifica si existe carpeta `INFORME DE CAMPO DE CONCRETO FRESCO_827349`
   - Si NO existe: la crea automáticamente
   - Si SÍ existe: reutiliza la existente

4. **Subida de Archivo**
   - Convierte base64 a buffer binario
   - Sube con nombre predeterminado:
     - `Elaboro firma` → `laboratorista.jpg`
     - `Solicita firma` → `residente.jpg`
     - `Vo. Bo. firma` → `supervisor.jpg`

5. **Respuesta**
   ```json
   {
     "success": true,
     "fileId": "1abc123...",
     "fileUrl": "https://drive.google.com/file/d/1abc123.../view",
     "folderName": "INFORME DE CAMPO DE CONCRETO FRESCO_827349",
     "fileName": "residente.jpg"
   }
   ```

## En Google Sheets

En lugar de almacenar la imagen en base64, se guarda el URL de Drive:

| Campo | Valor |
|-------|-------|
| Elaboro firma | `https://drive.google.com/file/d/1abc123.../view` |
| Solicita firma | `https://drive.google.com/file/d/1def456.../view` |
| Vo. Bo. firma | `https://drive.google.com/file/d/1ghi789.../view` |

## Ventajas

✅ **Organización:** Cada folio tiene su carpeta con todas las firmas  
✅ **Espacio:** No ocupa espacio en Sheets  
✅ **Accesibilidad:** URLs públicas compartibles  
✅ **Seguridad:** Permisos de acceso controlados  
✅ **Escalabilidad:** Google Drive maneja ilimitadas imágenes  

## Configuración

**Variable de ambiente en `.env.local`:**
```
GOOGLE_DRIVE_FOLDER_ID=1KeYg_Y0vBWuyDA7Q1nrs8lNcMM9pTQVC
```

**Permisos requeridos:**
- `https://www.googleapis.com/auth/drive` (crear carpetas y subir archivos)
- `https://www.googleapis.com/auth/spreadsheets` (para guardar URLs en Sheets)

## Nombres de Archivo Automatizados

| Tipo de Firma | Archivo |
|---------------|---------|
| Laboratorista | `laboratorista.jpg` |
| Residente | `residente.jpg` |
| Supervisor | `supervisor.jpg` |

## Ejemplo de Carpeta Creada

**Folio:** 827349  
**Carpeta:** `INFORME DE CAMPO DE CONCRETO FRESCO_827349`

Al hacer clic en la carpeta en Google Drive, verá:
- laboratorista.jpg (Firma del que elaboró el informe)
- residente.jpg (Firma del residente que autorizó)
- supervisor.jpg (Firma del supervisor/Vo. Bo.)

## Error Handling

Si falla la subida a Drive:
1. Se registra en logs
2. No bloquea el guardado en Sheets
3. Se guarda NULL en el campo de firma
4. Usuario ve advertencia: "Error al guardar firma"

## Troubleshooting

### Las firmas no se suben
- Verificar que `GOOGLE_DRIVE_FOLDER_ID` sea correcto
- Revisar permisos de Drive en Google Cloud Console
- Ver logs de servidor para errores específicos

### Carpeta duplicada
- Sistema verifica si existe antes de crear
- Si existen dos con el mismo nombre, sube a la primera encontrada
- Limpiar carpetas duplicadas manualmente en Drive

### URL del archivo expirado
- Los URLs de Drive no expiran
- Son válidos indefinidamente mientras la carpeta exista

## Acceso a las Firmas

1. **Desde Google Sheets:** Click en el URL de la firma
2. **Desde Google Drive:** Navegar a carpeta del folio
3. **Compartir:** Hacer click derecho en archivo → Compartir → Copiar link
