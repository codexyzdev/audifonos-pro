# Scopes de Drive API

Explicación de los permisos que solicita la aplicación y las razones detrás de cada elección.

---

## Scope `drive.appdata`

**URL completa:** `https://www.googleapis.com/auth/drive.appdata`

Este scope otorga acceso exclusivo a un espacio de almacenamiento privado llamado **`appDataFolder`**, separado del Drive principal del usuario. Permite:

- Crear, leer y actualizar archivos dentro de ese espacio.
- Almacenar datos de la aplicación sin interferir con los archivos del usuario.

El archivo `audifonos-inventory.json` se guarda en `appDataFolder` y **no aparece en el Drive principal** del usuario ni es visible desde la interfaz de Google Drive.

---

## Por qué `appDataFolder` y no el Drive completo

La alternativa habría sido usar `https://www.googleapis.com/auth/drive` (acceso completo) o `drive.file` (acceso a archivos creados por la app, pero visibles en Drive). Se eligió `appDataFolder` por tres razones:

1. **Privacidad**: el inventario es un dato interno de la app; no tiene sentido que ocupe espacio visible en el Drive del usuario.
2. **Permisos mínimos**: solicitar solo lo necesario reduce el riesgo en caso de que el token sea comprometido. Google también es más estricto en la verificación de apps que piden scopes amplios.
3. **Experiencia de usuario**: el usuario no ve archivos "extraños" en su Drive ni necesita gestionarlos manualmente.

---

## Otros scopes solicitados

| Scope | Qué permite | Por qué se usa |
|---|---|---|
| `openid` | Identificar al usuario mediante un token de identidad (ID token) | Requerido por el flujo OAuth 2.0 de Google para autenticación |
| `email` | Leer la dirección de correo del usuario | Mostrar el correo en el perfil y asociar la sesión a una identidad |
| `profile` | Leer nombre y foto de perfil | Mostrar el nombre y avatar del usuario autenticado en la UI |

Estos tres scopes son estándar de OpenID Connect y no otorgan acceso a ningún dato de Drive ni a otros servicios de Google.

---

## Buenas prácticas de seguridad

- **Nunca almacenes el `access_token` en `localStorage`**. La app lo guarda en memoria (estado de React) para reducir la superficie de ataque ante XSS.
- **El token expira**. Los access tokens de Google tienen una vida útil corta (~1 hora). Si la app recibe un error `401`, debe solicitar al usuario que vuelva a iniciar sesión.
- **No solicites más scopes de los necesarios**. Agregar scopes innecesarios complica la verificación de la app por parte de Google y genera desconfianza en el usuario.
- **Modo de prueba vs. producción**. Mientras la app esté en modo "Externo" sin verificar, solo los testers registrados pueden autenticarse. Para uso público, completa el proceso de verificación de Google.
