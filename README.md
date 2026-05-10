# Wedding Photo Upload - QR para boda

Aplicación web enfocada en un flujo simple para boda:

```txt
Invitado escanea QR
↓
Abre la página de subida
↓
Toma una foto o selecciona fotos
↓
La app prepara/comprime la imagen
↓
Se sube a Google Drive del dueño de la boda
```

La app está pensada para invitados que no quieren instalar nada, no quieren iniciar sesión y solo necesitan una pantalla clara para compartir fotos del evento.

---

## ✨ Funciones principales

- 📸 **Subida de fotos desde celular**
  - Botón principal para tomar una foto.
  - Botón secundario para seleccionar fotos desde galería.

- 📱 **Flujo mobile-first**
  - Diseñado para celular.
  - Botones grandes.
  - Textos simples.
  - Sin login para invitados.

- 🎥 **Cámara usando input nativo**
  - Se usa un input de archivo con captura de imagen:
    ```html
    <input type="file" accept="image/*" capture="environment" />
    ```

- 🖼️ **Compresión antes de subir**
  - Las fotos grandes se preparan en el navegador antes de enviarlas.
  - El objetivo es evitar errores por límite de tamaño en Netlify Functions.
  - Las fotos que ya están debajo del límite pueden subirse sin recomprimir agresivamente.

- 📤 **Subida a Google Drive**
  - Las fotos se guardan en una carpeta de Google Drive del dueño de la boda.
  - Para subir archivos se usa **OAuth 2.0 con refresh token**, no Service Account.

- 📊 **Configuración desde Google Sheets**
  - Textos, colores y algunos valores de la página de upload se leen desde Google Sheets.
  - Para leer Google Sheets sí se usa **Service Account**.

- 🔳 **Generación de QR**
  - El QR apunta a la página pública de subida.
  - El QR se puede mostrar en una página del proyecto o imprimir para centros de mesa.

- 🚀 **Deploy en Netlify**
  - Frontend React.
  - Backend con Netlify Functions.
  - Sin base de datos.

---

## 🎯 Enfoque actual del proyecto

Este proyecto ya no está enfocado en ser una página completa de boda con muchas secciones, capturas y galería pública.

El enfoque actual es:

```txt
Subir fotos de boda + configurar pantalla desde Google Sheets + generar QR
```

Por ahora, lo importante es que el flujo de upload sea estable para el evento.

---

## 🧱 Arquitectura

```txt
Invitado
↓
Página pública de upload
↓
Netlify Function de upload
↓
Google Drive usando OAuth del dueño
↓
Carpeta de fotos de la boda
```

Para la configuración visual/textos:

```txt
Página de upload
↓
Netlify Function upload-config
↓
Google Sheets API
↓
Hoja UploadConfig
```

---

## 📋 Requisitos

- Node.js instalado.
- Cuenta de Google.
- Proyecto en Google Cloud.
- Google Drive API habilitada.
- Google Sheets API habilitada.
- Cuenta de Netlify.
- Carpeta en Google Drive para guardar las fotos.
- Google Sheet para configurar textos y colores.

---

## 🚀 Instalación local

### 1. Clonar el repositorio

```bash
git clone <your-repo-url>
cd wedding-invite
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo `.env`

Copia el archivo de ejemplo:

```bash
cp env.example.txt .env
```

O crea un archivo `.env` en la raíz del proyecto.

### 4. Agregar variables de entorno

Ejemplo:

```env
# Google Sheets - usado para leer configuración de la página
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
GOOGLE_SPREADSHEET_ID=your_google_spreadsheet_id

# Google Drive - usado para subir fotos al Drive personal del dueño
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id

# Opcional: URL final de la página pública de upload para generar QR
REACT_APP_PUBLIC_UPLOAD_URL=https://your-site.netlify.app/upload
```

> Importante: nunca subas `.env` a GitHub.

### 5. Iniciar el proyecto

```bash
npm start
```

La app abrirá normalmente en:

```txt
http://localhost:3000
```

---

## 🔐 Variables de entorno

| Variable | Para qué sirve | Obligatoria |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Credenciales de Service Account para leer Google Sheets | Sí |
| `GOOGLE_SPREADSHEET_ID` | ID del Google Sheet donde está la configuración | Sí |
| `GOOGLE_CLIENT_ID` | Client ID de OAuth para subir fotos a Drive | Sí |
| `GOOGLE_CLIENT_SECRET` | Client Secret de OAuth para subir fotos a Drive | Sí |
| `GOOGLE_REFRESH_TOKEN` | Token para subir fotos a Drive sin iniciar sesión cada vez | Sí |
| `GOOGLE_DRIVE_FOLDER_ID` | ID de la carpeta de Drive donde se guardan las fotos | Sí |
| `REACT_APP_PUBLIC_UPLOAD_URL` | URL pública de upload usada para el QR | Opcional |

---

## 📊 Configuración con Google Sheets

La página de upload puede leer textos, colores y valores desde Google Sheets.

### 1. Crear Google Sheet

Crea una hoja de cálculo en Google Sheets.

### 2. Crear pestaña `UploadConfig`

El nombre de la pestaña debe ser exactamente:

```txt
UploadConfig
```

### 3. Estructura de columnas

Usa esta estructura:

| Columna | Uso |
|---|---|
| A | Key |
| B | Value |
| C | Descripción para humanos |

Ejemplo:

```txt
albumLabel                 Álbum de la boda                         Texto pequeño arriba del nombre del evento.
eventName                  Boda de María y José                      Nombre principal que se muestra grande.
instructions               Toma una foto y se guardará...            Instrucción debajo del nombre.
cameraButton               Tomar foto                                Texto del botón principal.
maxFileSize                4                                         Tamaño máximo en MB.
allowedTypes               image/jpeg,image/png,image/webp           Tipos permitidos.
primaryColor               #4338ca                                   Color principal.
```

La app debe leer principalmente las columnas `A:B`. La columna `C` es solo documentación.

### 4. Compartir Google Sheet con Service Account

Busca el correo de tu Service Account. Se ve parecido a:

```txt
wedding-website@your-project.iam.gserviceaccount.com
```

En Google Sheets:

```txt
Share
↓
Pegar correo de Service Account
↓
Permiso: Viewer o Editor
↓
Send
```

Con esto la Netlify Function podrá leer la configuración.

---

## 🤖 Google Cloud: Service Account para Google Sheets

La Service Account se usa solamente para leer Google Sheets.

### Pasos

1. Entra a Google Cloud Console.
2. Crea o selecciona tu proyecto.
3. Activa la API:
   ```txt
   Google Sheets API
   ```
4. Ve a:
   ```txt
   IAM & Admin → Service Accounts
   ```
5. Crea una Service Account.
6. Crea una key en formato JSON.
7. Copia todo el JSON en la variable:
   ```env
   GOOGLE_SERVICE_ACCOUNT_JSON=...
   ```
8. Comparte tu Google Sheet con el correo de esa Service Account.

### Importante

La Service Account **no se usa para subir fotos a Google Drive personal**.

Si intentas subir fotos a una carpeta de `Mi unidad` usando Service Account, puede aparecer este error:

```txt
Service Accounts do not have storage quota.
```

Por eso, para Drive se usa OAuth.

---

## 📁 Google Drive: carpeta para fotos

### 1. Crear carpeta

En tu Google Drive personal crea una carpeta, por ejemplo:

```txt
Fotos Boda
```

### 2. Obtener el folder ID

Abre la carpeta. La URL será parecida a:

```txt
https://drive.google.com/drive/folders/ABC123XYZ789
```

El ID es la parte final:

```env
GOOGLE_DRIVE_FOLDER_ID=ABC123XYZ789
```

Esta carpeta será donde se guardarán las fotos subidas por los invitados.

---

## 🔑 OAuth para subir fotos a Google Drive

Para que las fotos se guarden en tu Google Drive personal, se usa OAuth 2.0.

Los invitados no inician sesión con Google. Solo el dueño de la boda autoriza la app una vez.

### Flujo

```txt
Dueño de la boda autoriza Google una vez
↓
Se obtiene GOOGLE_REFRESH_TOKEN
↓
Netlify Function usa ese token
↓
Las fotos se suben al Drive del dueño
```

---

## 🧩 Crear OAuth Client

En Google Cloud Console:

1. Ve a:
   ```txt
   APIs & Services → OAuth consent screen
   ```

2. Configura la pantalla de consentimiento.

3. Publica la app en modo:
   ```txt
   In production
   ```

   Esto ayuda a evitar que el refresh token caduque rápidamente por estar en modo testing.

4. Ve a:
   ```txt
   APIs & Services → Credentials
   ```

5. Crea:
   ```txt
   OAuth client ID
   ```

6. Tipo:
   ```txt
   Web application
   ```

7. Agrega este redirect URI para usar OAuth Playground:

   ```txt
   https://developers.google.com/oauthplayground
   ```

8. Copia:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

---

## 🔄 Obtener `GOOGLE_REFRESH_TOKEN`

Usa OAuth Playground.

### Pasos

1. Abre OAuth 2.0 Playground.
2. Abre el engrane de configuración.
3. Activa:
   ```txt
   Use your own OAuth credentials
   ```
4. Configura:
   ```txt
   OAuth flow: Server-side
   Access type: Offline
   Force prompt: Consent Screen
   ```
5. Pega tu:
   ```txt
   Client ID
   Client Secret
   ```
6. En scopes, usa:
   ```txt
   https://www.googleapis.com/auth/drive
   ```
7. Da clic en:
   ```txt
   Authorize APIs
   ```
8. Inicia sesión con la cuenta de Google donde quieres guardar las fotos.
9. Acepta los permisos.
10. Da clic en:
    ```txt
    Exchange authorization code for tokens
    ```
11. Copia el valor de:
    ```txt
    Refresh token
    ```

Ese valor va en:

```env
GOOGLE_REFRESH_TOKEN=...
```

### Nota sobre verificación de Google

Puede aparecer un mensaje como:

```txt
Google hasn't verified this app
```

Para este caso está bien, porque solo el dueño de la boda inicia sesión para generar el token. Los invitados no usan Google Login.

---

## 📸 Flujo de subida de fotos

### Tomar foto

El flujo principal es de una foto por vez:

```txt
Tocar “Tomar foto”
↓
Se abre cámara del celular
↓
Tomar foto
↓
Preparar/comprimir si hace falta
↓
Subir a Google Drive
↓
Mostrar mensaje de éxito
```

Input recomendado:

```html
<input type="file" accept="image/*" capture="environment" />
```

### Seleccionar varias fotos

El botón secundario puede permitir seleccionar varias fotos, pero deben subirse de forma secuencial:

```txt
Seleccionar varias fotos
↓
Preparar 1 de N
↓
Subir 1 de N
↓
Preparar 2 de N
↓
Subir 2 de N
↓
Mostrar resumen final
```

No se deben enviar todas juntas en una sola request.

### Regla importante

```txt
Una foto = una request
```

Esto reduce el riesgo de fallos en Netlify Functions.

---

## 🗜️ Compresión de imágenes

Para cuidar Netlify y evitar errores por fotos pesadas, la app puede comprimir fotos antes de subirlas.

Configuración recomendada:

```txt
maxFileSize: 4 MB
maxWidthOrHeight: 3000px o 3200px
quality inicial: 0.92 o 0.95
quality mínima normal: 0.8
```

Regla recomendada:

```txt
Si la foto pesa 4 MB o menos:
→ subir original

Si la foto pesa más de 4 MB:
→ comprimir/redimensionar hasta quedar debajo de 4 MB
```

Esto evita que fotos pequeñas, por ejemplo de 1.2 MB, se recompriman innecesariamente a 700 KB o menos.

---

## 🔳 Generar QR

El QR debe apuntar a la URL pública de la página de upload.

Ejemplo:

```txt
https://your-site.netlify.app/upload
```

Puedes manejar una página interna como:

```txt
/qr
```

Esa página puede mostrar un QR grande para imprimir.

### Recomendación

No imprimas un QR de una URL temporal de preview.

Imprime el QR solo cuando tengas definida la URL final:

```txt
Dominio final
Ruta final de upload
Deploy probado
```

---

## 🚀 Deploy en Netlify

### 1. Subir código a GitHub

Asegúrate de no subir `.env`.

### 2. Crear sitio en Netlify

En Netlify:

```txt
Add new site
↓
Import an existing project
↓
Seleccionar repositorio
```

### 3. Build settings

Configura:

```txt
Build command: npm run build
Publish directory: build
```

### 4. Agregar variables de entorno

En Netlify:

```txt
Site configuration
↓
Environment variables
```

Agrega:

```env
GOOGLE_SERVICE_ACCOUNT_JSON=...
GOOGLE_SPREADSHEET_ID=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_DRIVE_FOLDER_ID=...
REACT_APP_PUBLIC_UPLOAD_URL=...
```

### 5. Redeploy

Después de agregar o cambiar variables:

```txt
Deploys
↓
Trigger deploy
↓
Clear cache and deploy site
```

---

## 🧪 Checklist de pruebas

Antes de usarlo en la boda:

### Pruebas locales

- [ ] La página de upload carga.
- [ ] La configuración se lee desde Google Sheets.
- [ ] Los colores/textos cambian al modificar la hoja.
- [ ] Se puede tomar una foto desde celular.
- [ ] Se puede seleccionar una foto desde galería.
- [ ] Se pueden seleccionar varias fotos.
- [ ] Las fotos se suben una por una.
- [ ] Las fotos aparecen en Google Drive.
- [ ] Si una foto falla, se muestra error claro.

### Pruebas en Netlify

- [ ] La URL pública funciona.
- [ ] El QR abre la página correcta.
- [ ] Se probó desde Android.
- [ ] Se probó desde iPhone.
- [ ] Se probó con datos móviles.
- [ ] Se revisaron logs de Netlify Functions.
- [ ] Se subieron varias fotos de prueba.
- [ ] El refresh token funciona después del redeploy.

### Antes de imprimir QR

- [ ] La URL final ya no va a cambiar.
- [ ] El QR fue probado en varios celulares.
- [ ] El QR no apunta a un deploy preview.
- [ ] Las fotos llegan al Drive correcto.

---

## 📈 Logs en Netlify

Para revisar errores de funciones:

```txt
Netlify
↓
Tu sitio
↓
Logs & Metrics
↓
Functions
```

Revisa especialmente funciones como:

```txt
upload
upload-config
```

Errores comunes a buscar:

```txt
Payload too large
413
invalid_grant
Google Drive
Google Sheets
File upload failed
accessNotConfigured
```

---

## ⚠️ Limitaciones importantes

### Netlify Functions

Las fotos pasan por una Netlify Function antes de llegar a Drive.

Por eso conviene mantener cada imagen debajo de un límite seguro, por ejemplo:

```txt
3.5 MB a 4 MB por foto
```

Si una foto pesa mucho, debe comprimirse antes de subir.

### Google Drive

El almacenamiento depende de la cuenta de Google del dueño de la boda.

Con Google Drive gratis tienes 15 GB. Con Google One de 100 GB hay mucho más margen para una boda de solo fotos.

### Google Sheets

La hoja se usa para configuración. No conviene leerla en exceso en cada interacción.

La página puede leer configuración al cargar y usar fallback si falla.

### Sin base de datos

Esta versión no usa base de datos.

Eso simplifica el proyecto, pero también significa que el control de invitados, historial detallado o permisos avanzados no están contemplados.

---

## 🔧 Troubleshooting

### Error: `Google Sheets API has not been used...`

Significa que falta habilitar Google Sheets API en tu proyecto de Google Cloud.

Solución:

```txt
Google Cloud Console
↓
APIs & Services
↓
Library
↓
Google Sheets API
↓
Enable
```

---

### Error: `Service Accounts do not have storage quota`

Significa que estás intentando subir fotos a Google Drive usando Service Account.

En esta versión, la Service Account solo debe usarse para Google Sheets.

Para subir fotos a Drive personal debes usar:

```txt
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
GOOGLE_DRIVE_FOLDER_ID
```

---

### Error: `invalid_grant`

Puede significar que el refresh token expiró, fue revocado o fue generado en modo Testing.

Solución recomendada:

```txt
1. Poner OAuth app en In production
2. Generar nuevo refresh token
3. Actualizar GOOGLE_REFRESH_TOKEN en Netlify
4. Redeploy
```

---

### Error: `Payload too large` o `413`

La foto es demasiado grande para Netlify Functions.

Solución:

```txt
1. Comprimir en frontend
2. Subir una foto por request
3. Reducir maxFileSize a 3.5 MB si sigue fallando
```

---

### La configuración no cambia aunque edito Google Sheets

Revisa:

```txt
1. Que la pestaña se llame UploadConfig
2. Que las keys estén en columna A
3. Que los values estén en columna B
4. Que GOOGLE_SPREADSHEET_ID sea correcto
5. Que la hoja esté compartida con la Service Account
6. Que la función upload-config no tenga cache demasiado agresivo
```

---

### Las fotos no aparecen en Drive

Revisa:

```txt
1. GOOGLE_DRIVE_FOLDER_ID
2. GOOGLE_CLIENT_ID
3. GOOGLE_CLIENT_SECRET
4. GOOGLE_REFRESH_TOKEN
5. Logs de la función upload
6. Que el refresh token haya sido generado con scope de Drive
```

---

## 💰 Costos estimados

Para una boda con solo fotos:

- Google Drive gratis: 15 GB.
- Google One 100 GB: opcional si quieres más margen.
- Google Sheets: gratis para este uso.
- Google Cloud APIs: normalmente suficiente para este uso.
- Netlify: puede funcionar en free tier, pero conviene monitorear límites.
- Dominio personalizado: opcional.

El consumo real depende de:

```txt
Número de invitados
Fotos por invitado
Peso final de cada foto
Tráfico de la página
```

Ejemplo:

```txt
250 personas × 5 fotos × 2 MB = 2.5 GB aprox.
250 personas × 10 fotos × 2 MB = 5 GB aprox.
```

Con fotos comprimidas y 100 GB de Drive, el almacenamiento no debería ser problema.

---

## 🔒 Seguridad

- No subir `.env` a GitHub.
- No compartir capturas donde se vean tokens.
- Si un token se expone, generar uno nuevo.
- Los invitados no necesitan iniciar sesión.
- El `GOOGLE_REFRESH_TOKEN` debe tratarse como contraseña.
- El backend es el único que debe tener credenciales.
- El frontend nunca debe exponer secretos de Google.

---

## 📌 Resumen rápido

```txt
Service Account → leer Google Sheets
OAuth Refresh Token → subir fotos a Google Drive
Netlify Functions → backend
Google Sheets → configuración de textos y colores
Google Drive → almacenamiento de fotos
QR → enlace público de upload
Sin base de datos
Sin login para invitados
```

---

Hecho para compartir fotos de boda de la forma más simple posible.
