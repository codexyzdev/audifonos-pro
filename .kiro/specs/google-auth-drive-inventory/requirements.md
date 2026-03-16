# Requirements Document

## Introduction

Esta funcionalidad agrega autenticación con Google Sign-In a la aplicación de inventario de audífonos, y migra el almacenamiento del inventario de `localStorage` a un archivo JSON en el Google Drive del usuario autenticado. El inventario existente (500 audífonos: 100 de cada color azul, blanco, verde, rosa y negro) se preserva como estado inicial. Adicionalmente, se crea documentación en la carpeta `docs/` explicando la configuración en Google Cloud Console.

## Glossary

- **App**: La aplicación React de inventario de audífonos.
- **Auth_Provider**: El módulo responsable de gestionar la autenticación con Google OAuth 2.0.
- **Drive_Service**: El módulo responsable de leer y escribir el archivo de inventario en Google Drive.
- **Inventory_Hook**: El hook `useInventory` que gestiona el estado del inventario.
- **Inventory_File**: El archivo JSON almacenado en Google Drive que contiene el estado del inventario.
- **User**: La persona autenticada que utiliza la App.
- **Session**: El estado de autenticación activo del User en la App.
- **ColorType**: Tipo que representa los colores de audífonos: `azul`, `blanco`, `verde`, `rosa`, `negro`.
- **InventoryState**: Estructura de datos que contiene `products` (stock por color) y `transactions` (historial).
- **Transaction**: Registro de una entrada o salida de inventario con id, tipo, color, cantidad, fecha y notas.
- **Initial_State**: Estado inicial del inventario con 100 unidades de cada ColorType (500 total).
- **OAuth_Client_ID**: Identificador de cliente OAuth 2.0 obtenido desde Google Cloud Console.
- **Drive_API**: La API de Google Drive v3 utilizada para operaciones de archivos.

---

## Requirements

### Requirement 1: Autenticación con Google Sign-In

**User Story:** Como usuario, quiero iniciar sesión con mi cuenta de Google, para que mis datos de inventario estén vinculados a mi identidad y sean accesibles de forma segura.

#### Acceptance Criteria

1. THE App SHALL mostrar un botón de "Iniciar sesión con Google" cuando no existe una Session activa.
2. WHEN el User hace clic en el botón de inicio de sesión, THE Auth_Provider SHALL iniciar el flujo OAuth 2.0 de Google con los scopes `openid`, `email`, `profile` y `https://www.googleapis.com/auth/drive.appdata`.
3. WHEN el flujo OAuth 2.0 se completa exitosamente, THE Auth_Provider SHALL almacenar el access token y la información del User en memoria de la Session.
4. WHEN la autenticación es exitosa, THE App SHALL mostrar el nombre y foto de perfil del User autenticado.
5. IF el flujo OAuth 2.0 falla o el User cancela el proceso, THEN THE Auth_Provider SHALL mostrar un mensaje de error descriptivo y permitir reintentar.
6. WHEN el User hace clic en "Cerrar sesión", THE Auth_Provider SHALL revocar la Session activa y limpiar los datos de autenticación en memoria.
7. WHILE no existe una Session activa, THE App SHALL ocultar todas las funcionalidades del inventario y mostrar únicamente la pantalla de inicio de sesión.

---

### Requirement 2: Almacenamiento del inventario en Google Drive

**User Story:** Como usuario, quiero que mi inventario se guarde en mi Google Drive, para que los datos persistan entre sesiones y dispositivos sin depender del almacenamiento local del navegador.

#### Acceptance Criteria

1. WHEN el User inicia sesión por primera vez, THE Drive_Service SHALL buscar un archivo llamado `audifonos-inventory.json` en el espacio `appDataFolder` de Google Drive del User.
2. IF el archivo `audifonos-inventory.json` no existe en Google Drive, THEN THE Drive_Service SHALL crear el archivo con el Initial_State del inventario.
3. WHEN el archivo `audifonos-inventory.json` existe en Google Drive, THE Drive_Service SHALL leer su contenido y cargarlo como el estado activo del Inventory_Hook.
4. WHEN el InventoryState cambia (entrada, salida o reinicio), THE Drive_Service SHALL escribir el nuevo estado completo en el Inventory_File dentro de los 2 segundos siguientes al cambio.
5. IF la escritura en Google Drive falla, THEN THE Drive_Service SHALL reintentar la operación hasta 3 veces con espera exponencial, y notificar al User si todos los reintentos fallan.
6. IF la lectura del Inventory_File falla o el contenido es JSON inválido, THEN THE Drive_Service SHALL usar el Initial_State y notificar al User del error.
7. WHILE una operación de lectura o escritura en Drive_API está en progreso, THE App SHALL mostrar un indicador de sincronización visible al User.
8. THE Drive_Service SHALL usar el scope `https://www.googleapis.com/auth/drive.appdata` para que el Inventory_File no sea visible en el Drive principal del User.

---

### Requirement 3: Preservación del estado inicial del inventario

**User Story:** Como usuario, quiero que el inventario comience con 500 audífonos (100 de cada color), para que el estado inicial refleje el pedido original de China.

#### Acceptance Criteria

1. THE Inventory_Hook SHALL definir el Initial_State con 100 unidades de cada ColorType: `azul`, `blanco`, `verde`, `rosa` y `negro`.
2. THE Inventory_Hook SHALL definir las transacciones iniciales como 5 entradas de tipo `entrada`, una por cada ColorType, con cantidad 100 y notas `"Pedido inicial de China"`.
3. WHEN el Drive_Service crea el Inventory_File por primera vez, THE Drive_Service SHALL usar el Initial_State como contenido del archivo.
4. WHEN el User reinicia el inventario, THE Inventory_Hook SHALL restaurar el InventoryState al Initial_State y THE Drive_Service SHALL persistir ese estado en el Inventory_File.

---

### Requirement 4: Migración desde localStorage

**User Story:** Como usuario existente, quiero que mis datos actuales en localStorage se migren a Google Drive al iniciar sesión, para no perder el historial de transacciones previo.

#### Acceptance Criteria

1. WHEN el User inicia sesión y THE Drive_Service detecta que no existe un Inventory_File en Google Drive, THE App SHALL verificar si existe datos en `localStorage` bajo la clave `audifonos-inventory-v1`.
2. IF existen datos válidos en `localStorage`, THEN THE Drive_Service SHALL usar esos datos como contenido inicial del Inventory_File en lugar del Initial_State.
3. WHEN la migración desde localStorage se completa exitosamente, THE App SHALL eliminar la entrada `audifonos-inventory-v1` de `localStorage`.
4. IF los datos en `localStorage` son JSON inválido o tienen estructura incorrecta, THEN THE App SHALL ignorar los datos de localStorage y usar el Initial_State.

---

### Requirement 5: Configuración de la aplicación en Google Cloud Console

**User Story:** Como desarrollador, quiero documentación clara sobre cómo configurar el proyecto en Google Cloud Console, para poder habilitar Google Sign-In y Drive API correctamente.

#### Acceptance Criteria

1. THE App SHALL requerir un OAuth_Client_ID configurado como variable de entorno `VITE_GOOGLE_CLIENT_ID` para funcionar.
2. IF la variable de entorno `VITE_GOOGLE_CLIENT_ID` no está definida al iniciar la App, THEN THE App SHALL mostrar un error de configuración claro en la consola del navegador.
3. THE App SHALL incluir un archivo `docs/google-cloud-setup.md` con instrucciones paso a paso para crear un proyecto en Google Cloud Console, habilitar Drive API, configurar la pantalla de consentimiento OAuth y obtener el OAuth_Client_ID.
4. THE App SHALL incluir un archivo `docs/environment-setup.md` con instrucciones para configurar las variables de entorno necesarias en desarrollo y producción.
5. THE App SHALL incluir un archivo `docs/drive-api-scopes.md` explicando los scopes de Drive API utilizados y por qué se eligió `appDataFolder` en lugar del Drive principal.

---

### Requirement 6: Experiencia de usuario durante sincronización

**User Story:** Como usuario, quiero saber en todo momento si mis datos están sincronizados con Google Drive, para tener confianza en que no perderé información.

#### Acceptance Criteria

1. THE App SHALL mostrar un indicador de estado de sincronización con al menos tres estados: `sincronizado`, `sincronizando` y `error`.
2. WHEN el InventoryState se guarda exitosamente en el Inventory_File, THE App SHALL mostrar el estado `sincronizado` con la hora del último guardado.
3. WHILE THE Drive_Service está escribiendo en Google Drive, THE App SHALL mostrar el estado `sincronizando`.
4. IF una operación de escritura falla después de todos los reintentos, THEN THE App SHALL mostrar el estado `error` con un botón para reintentar manualmente.
5. WHEN el User hace clic en el botón de reintento manual, THE Drive_Service SHALL intentar escribir el InventoryState actual en el Inventory_File.
