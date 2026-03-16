# Configuración en Google Cloud Console

Guía paso a paso para configurar el proyecto en Google Cloud Console y obtener las credenciales necesarias para la autenticación con Google y el acceso a Drive API.

---

## 1. Crear un proyecto en GCP

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Haz clic en el selector de proyectos (parte superior) → **Nuevo proyecto**.
3. Asigna un nombre (ej. `audifonos-inventory`) y haz clic en **Crear**.
4. Asegúrate de que el proyecto nuevo esté seleccionado en el selector.

---

## 2. Habilitar la Google Drive API

1. En el menú lateral, ve a **APIs y servicios** → **Biblioteca**.
2. Busca `Google Drive API`.
3. Haz clic en el resultado y luego en **Habilitar**.

---

## 3. Configurar la pantalla de consentimiento OAuth

1. Ve a **APIs y servicios** → **Pantalla de consentimiento de OAuth**.
2. Selecciona el tipo de usuario:
   - **Interno**: solo usuarios de tu organización Google Workspace.
   - **Externo**: cualquier cuenta de Google (recomendado para desarrollo/pruebas).
3. Completa los campos obligatorios:
   - **Nombre de la aplicación**: `AudífonosPro` (o el nombre que prefieras).
   - **Correo electrónico de soporte**: tu correo.
   - **Correo de contacto del desarrollador**: tu correo.
4. En la sección **Permisos (Scopes)**, haz clic en **Agregar o quitar permisos** y añade los siguientes:
   - `openid`
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.appdata`
5. Guarda y continúa.

> Si la app está en modo **Externo** y no ha pasado la verificación de Google, solo los usuarios agregados como "testers" podrán autenticarse. Agrega tus cuentas de prueba en la sección **Usuarios de prueba**.

---

## 4. Crear un OAuth 2.0 Client ID

1. Ve a **APIs y servicios** → **Credenciales**.
2. Haz clic en **Crear credenciales** → **ID de cliente de OAuth**.
3. Selecciona el tipo de aplicación: **Aplicación web**.
4. Asigna un nombre (ej. `AudífonosPro Web`).
5. En **Orígenes autorizados de JavaScript**, agrega:
   - `http://localhost:3000` (desarrollo)
   - `https://tu-dominio.com` (producción, cuando corresponda)
6. Deja **URIs de redireccionamiento autorizados** vacío (no se usa con el flujo implícito de `@react-oauth/google`).
7. Haz clic en **Crear**.

---

## 5. Copiar el Client ID

Tras crear las credenciales, aparecerá un modal con el **ID de cliente** (formato: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`).

Copia ese valor — lo necesitarás para configurar la variable de entorno. Consulta [`environment-setup.md`](./environment-setup.md) para los siguientes pasos.
