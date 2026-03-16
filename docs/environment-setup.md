# Configuración de variables de entorno

La aplicación requiere el Client ID de OAuth 2.0 para funcionar. Este valor se expone al cliente a través de una variable de entorno con el prefijo `NEXT_PUBLIC_`.

---

## ¿Por qué `NEXT_PUBLIC_`?

Next.js solo expone al navegador las variables de entorno que comienzan con `NEXT_PUBLIC_`. Sin ese prefijo, la variable queda disponible únicamente en el servidor y el componente de autenticación no podrá leerla en el cliente.

---

## Desarrollo local

1. Crea el archivo `.env.local` en la raíz del proyecto (si no existe).
2. Agrega la siguiente línea con tu Client ID:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

3. Reinicia el servidor de desarrollo (`npm run dev`) para que Next.js cargue la variable.

> `.env.local` está en `.gitignore` por defecto en proyectos Next.js. No lo subas al repositorio.

---

## Producción en Vercel

1. Ve al dashboard de tu proyecto en [Vercel](https://vercel.com/).
2. Navega a **Settings** → **Environment Variables**.
3. Agrega una nueva variable:
   - **Name**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - **Value**: tu Client ID
   - **Environment**: `Production` (y `Preview` si lo necesitas)
4. Haz un nuevo deploy para que el cambio surta efecto.

---

## Otras plataformas

Configura la variable de entorno `NEXT_PUBLIC_GOOGLE_CLIENT_ID` según el mecanismo de tu plataforma (Railway, Render, AWS Amplify, etc.). El nombre y valor son los mismos; solo cambia dónde se define.

---

## Verificación

Si la variable no está definida al iniciar la app, verás el siguiente error en la consola del navegador:

```
[AuthContext] NEXT_PUBLIC_GOOGLE_CLIENT_ID no está definido.
```

Revisa que el archivo `.env.local` exista, que el nombre de la variable sea exacto y que hayas reiniciado el servidor.
