# Documento de Requisitos

## Introducción

Migración de la aplicación **AudífonosPro** desde Vite + React SPA hacia Next.js 15 con App Router. La app gestiona el inventario de audífonos por color (azul, blanco, verde, rosa, negro), permitiendo registrar entradas, salidas multi-producto y consultar el historial de transacciones.

La migración debe preservar toda la funcionalidad existente, mejorar la arquitectura aplicando RSC (React Server Components) donde sea posible, adoptar Screaming Architecture (organización por dominio), y mantener el mismo diseño visual dark con animaciones.

---

## Glosario

- **App**: La aplicación Next.js 15 resultante de la migración (AudífonosPro).
- **Inventory_Store**: Módulo de gestión de estado del inventario basado en `localStorage`.
- **Inventory_Page**: Página principal del dashboard de inventario (`app/page.tsx`).
- **Color_Card**: Componente que muestra el stock actual de un color específico con barra de progreso.
- **Entry_Form**: Formulario cliente para registrar entradas de stock por color.
- **Exit_Form**: Formulario cliente para registrar salidas/ventas multi-producto.
- **Stats_Panel**: Componente que muestra las estadísticas agregadas (stock total, entradas, ventas).
- **Transaction_History**: Componente cliente con historial filtrable de movimientos.
- **Animated_Background**: Componente cliente con orbs animados usando framer-motion.
- **ColorType**: Tipo union `'azul' | 'blanco' | 'verde' | 'rosa' | 'negro'`.
- **Transaction**: Entidad `{ id, type: 'entrada'|'salida', color, quantity, date, notes? }`.
- **InventoryState**: Estado `{ products: Record<ColorType, number>, transactions: Transaction[] }`.
- **COLOR_CONFIG**: Constante de configuración visual por color (gradient, hex, glow, name).
- **RSC**: React Server Component — componente que se renderiza en el servidor sin JavaScript en el cliente.
- **Screaming Architecture**: Organización de carpetas por dominio/feature (`inventory/`, `shared/`) en lugar de por tipo de archivo.
- **pnpm**: Gestor de paquetes utilizado en el proyecto.

---

## Requisitos

### Requisito 1: Configuración del Proyecto Next.js 15

**User Story:** Como desarrollador, quiero inicializar el proyecto con Next.js 15 y las dependencias correctas, para que la app tenga una base sólida con App Router y TypeScript.

#### Criterios de Aceptación

1. THE App SHALL usar Next.js 15 con App Router, React 19 y TypeScript como base del proyecto.
2. THE App SHALL usar pnpm como gestor de paquetes para instalar y gestionar dependencias.
3. THE App SHALL incluir Tailwind CSS v3, framer-motion, sonner, lucide-react y shadcn/ui como dependencias de producción.
4. THE App SHALL configurar el alias de importación `@/` apuntando a la raíz del proyecto para mantener consistencia con el código existente.
5. THE App SHALL tener `darkMode: 'class'` configurado en `tailwind.config.ts` y la clase `dark` aplicada en el elemento `<html>`.

---

### Requisito 2: Estructura Screaming Architecture

**User Story:** Como desarrollador, quiero organizar el código por dominio en lugar de por tipo de archivo, para que la estructura del proyecto refleje las capacidades del negocio.

#### Criterios de Aceptación

1. THE App SHALL organizar el código fuente bajo `src/` con los dominios `inventory/` y `shared/`.
2. THE App SHALL ubicar todos los tipos, constantes, hooks, componentes y acciones relacionados con el inventario bajo `src/inventory/`.
3. THE App SHALL ubicar componentes reutilizables sin dominio específico (layout, fondo animado, toaster) bajo `src/shared/`.
4. THE App SHALL seguir la convención de Next.js App Router ubicando las rutas bajo `src/app/`.
5. WHEN un componente pertenece exclusivamente al dominio de inventario, THE App SHALL ubicarlo en `src/inventory/components/` y no en una carpeta genérica de componentes.

---

### Requisito 3: Tipos y Constantes del Dominio

**User Story:** Como desarrollador, quiero que los tipos TypeScript y las constantes de configuración visual estén centralizados en el dominio de inventario, para que sean reutilizables desde cualquier componente.

#### Criterios de Aceptación

1. THE App SHALL definir `ColorType`, `Transaction`, `InventoryState` y `COLOR_CONFIG` en `src/inventory/types.ts`.
2. THE App SHALL exportar `COLOR_CONFIG` como constante con la configuración visual de los cinco colores: azul, blanco, verde, rosa y negro.
3. THE App SHALL mantener la misma estructura de `COLOR_CONFIG` que la app Vite: `{ name, gradient, hex, glow }` por cada `ColorType`.
4. WHEN se agrega un nuevo color en el futuro, THE App SHALL requerir únicamente modificar `ColorType` y `COLOR_CONFIG` para que todos los componentes lo reflejen automáticamente.

---

### Requisito 4: Gestión de Estado del Inventario (Cliente)

**User Story:** Como usuario, quiero que el inventario persista entre sesiones del navegador, para que no pierda los datos al recargar la página.

#### Criterios de Aceptación

1. THE Inventory_Store SHALL persistir el estado del inventario en `localStorage` bajo la clave `'audifonos-inventory-v1'`.
2. THE Inventory_Store SHALL inicializar el inventario con 100 unidades por color (500 total) si no existe ningún dato previo en `localStorage`.
3. WHEN el usuario registra una entrada, THE Inventory_Store SHALL incrementar el stock del color correspondiente y agregar la transacción al historial.
4. WHEN el usuario registra una salida multi-producto, THE Inventory_Store SHALL verificar que haya stock suficiente para cada color antes de procesar la operación.
5. IF el stock de algún color es insuficiente para una salida, THEN THE Inventory_Store SHALL retornar `{ success: false, error: string }` sin modificar el estado.
6. WHEN el usuario confirma el reinicio del inventario, THE Inventory_Store SHALL restaurar el estado inicial con 100 unidades por color y las transacciones iniciales.
7. THE Inventory_Store SHALL exponer las funciones derivadas `getTotalStock()`, `getTotalEntries()` y `getTotalExits()` calculadas a partir del estado actual.
8. THE Inventory_Store SHALL implementarse como un React hook (`useInventory`) con la directiva `'use client'` dado que accede a `localStorage` y usa `useState`/`useEffect`.

---

### Requisito 5: Página Principal como RSC

**User Story:** Como desarrollador, quiero que la página principal sea un React Server Component, para reducir el JavaScript enviado al cliente y mejorar el rendimiento inicial.

#### Criterios de Aceptación

1. THE Inventory_Page SHALL ser un React Server Component (sin directiva `'use client'`) que actúe como shell de composición.
2. THE Inventory_Page SHALL renderizar el layout principal: header sticky, grid de stats, grid de inventario, sección de acciones e historial, y footer.
3. THE Inventory_Page SHALL delegar el estado interactivo a un componente cliente (`InventoryDashboard`) que encapsule toda la lógica con `useInventory`.
4. WHILE la app carga el estado desde `localStorage`, THE Inventory_Page SHALL mostrar un indicador de carga (spinner animado) antes de renderizar el dashboard.
5. THE Inventory_Page SHALL definir los metadatos de la página (`title`, `description`) usando la API de metadata de Next.js (`export const metadata`).

---

### Requisito 6: Componente ColorCard

**User Story:** Como usuario, quiero ver el stock actual de cada color con una representación visual clara, para identificar rápidamente qué colores tienen stock bajo o agotado.

#### Criterios de Aceptación

1. THE Color_Card SHALL mostrar el nombre del color, la cantidad actual, la cantidad máxima y una barra de progreso animada.
2. WHEN el stock de un color es menor a 20 unidades, THE Color_Card SHALL mostrar un badge "Bajo" con estilo ámbar.
3. WHEN el stock de un color es igual a 0, THE Color_Card SHALL mostrar un badge "Agotado" con estilo rojo y reducir la opacidad de la tarjeta.
4. THE Color_Card SHALL aplicar el gradiente de color correspondiente de `COLOR_CONFIG` al ícono, barra de progreso y texto de cantidad.
5. THE Color_Card SHALL ser un componente cliente (`'use client'`) dado que usa animaciones de framer-motion con `motion.div` y `whileHover`.

---

### Requisito 7: Formulario de Entrada de Stock

**User Story:** Como operador, quiero registrar entradas de stock por color con una cantidad y nota opcional, para mantener el inventario actualizado cuando llegan nuevos productos.

#### Criterios de Aceptación

1. THE Entry_Form SHALL permitir seleccionar uno de los cinco colores disponibles mediante botones visuales con el gradiente de cada color.
2. THE Entry_Form SHALL requerir una cantidad mayor a 0 para habilitar el botón de confirmación.
3. WHEN el usuario confirma la entrada, THE Entry_Form SHALL llamar al callback `onSubmit(color, quantity, notes?)` y limpiar el formulario.
4. THE Entry_Form SHALL mostrar un estado colapsado (botón) y un estado expandido (formulario) con transición animada.
5. THE Entry_Form SHALL ser un componente cliente (`'use client'`) dado que gestiona estado local con `useState` y maneja eventos de formulario.

---

### Requisito 8: Formulario de Salida Multi-Producto

**User Story:** Como operador, quiero registrar ventas de múltiples colores en una sola operación, para reflejar con precisión las ventas que incluyen varios productos.

#### Criterios de Aceptación

1. THE Exit_Form SHALL permitir agregar múltiples ítems `{ color, quantity }` a una lista antes de confirmar la venta.
2. THE Exit_Form SHALL mostrar el stock disponible de cada color en el selector de colores y deshabilitar los colores con stock 0.
3. WHEN el usuario intenta agregar una cantidad que supera el stock disponible de un color, THE Exit_Form SHALL mostrar un mensaje de error inline sin cerrar el formulario.
4. THE Exit_Form SHALL mostrar el total de unidades en la venta actual antes de confirmar.
5. WHEN el usuario confirma la venta, THE Exit_Form SHALL llamar al callback `onSubmit(items[], notes?)` y limpiar el formulario.
6. THE Exit_Form SHALL ser un componente cliente (`'use client'`) dado que gestiona estado local complejo con `useState` y maneja eventos de formulario.

---

### Requisito 9: Panel de Estadísticas

**User Story:** Como usuario, quiero ver un resumen del stock total, entradas y ventas en tarjetas visuales, para tener una visión rápida del estado del inventario.

#### Criterios de Aceptación

1. THE Stats_Panel SHALL mostrar tres métricas: stock total actual, total de unidades ingresadas y total de unidades vendidas.
2. THE Stats_Panel SHALL aplicar gradientes de color distintos a cada tarjeta: violeta para stock, esmeralda para entradas y rosa para ventas.
3. THE Stats_Panel SHALL mostrar un efecto de glow detrás del ícono de cada tarjeta usando el color correspondiente.
4. THE Stats_Panel SHALL ser un componente cliente (`'use client'`) dado que usa animaciones de framer-motion (`motion.div`, `whileHover`).

---

### Requisito 10: Historial de Transacciones

**User Story:** Como usuario, quiero consultar el historial de movimientos filtrado por tipo, para auditar las entradas y salidas del inventario.

#### Criterios de Aceptación

1. THE Transaction_History SHALL mostrar todas las transacciones ordenadas de más reciente a más antigua.
2. THE Transaction_History SHALL permitir filtrar las transacciones por tipo: todos, entradas o salidas.
3. WHEN se selecciona un filtro, THE Transaction_History SHALL actualizar la lista inmediatamente sin recargar la página.
4. THE Transaction_History SHALL mostrar por cada transacción: tipo (entrada/salida), color con su gradiente, cantidad, fecha formateada en español y notas opcionales.
5. WHEN no hay transacciones que coincidan con el filtro activo, THE Transaction_History SHALL mostrar un estado vacío con ícono y mensaje descriptivo.
6. THE Transaction_History SHALL ser un componente cliente (`'use client'`) dado que gestiona el estado del filtro con `useState`.

---

### Requisito 11: Diseño Visual y Tema Dark

**User Story:** Como usuario, quiero que la app mantenga el mismo diseño visual dark con fondo animado y efectos de glassmorphism, para que la experiencia visual sea consistente con la versión Vite.

#### Criterios de Aceptación

1. THE App SHALL usar `bg-gray-950` como color de fondo base en toda la aplicación.
2. THE Animated_Background SHALL renderizar tres orbs de colores (violeta, cyan, fucsia) con animaciones continuas usando framer-motion.
3. THE Animated_Background SHALL incluir un patrón de grid sutil con opacidad `0.03` superpuesto al fondo.
4. THE Animated_Background SHALL ser un componente cliente (`'use client'`) dado que usa `motion.div` de framer-motion.
5. THE App SHALL usar el componente `<Toaster>` de sonner con `theme="dark"` y estilos de glassmorphism para las notificaciones.
6. WHEN el usuario registra una entrada exitosa, THE App SHALL mostrar un toast de éxito con la descripción `+{quantity} audífonos {color}`.
7. WHEN el usuario registra una salida exitosa, THE App SHALL mostrar un toast de éxito con la descripción `{total} audífonos vendidos`.
8. IF la operación de salida falla por stock insuficiente, THEN THE App SHALL mostrar un toast de error con el mensaje descriptivo del error.

---

### Requisito 12: Header y Navegación

**User Story:** Como usuario, quiero un header sticky con el logo de la app y el botón de reinicio, para acceder rápidamente a las acciones globales desde cualquier posición de scroll.

#### Criterios de Aceptación

1. THE App SHALL renderizar un header sticky con `position: sticky; top: 0` y efecto de `backdrop-blur` sobre el contenido.
2. THE App SHALL mostrar en el header el logo (ícono de audífonos con gradiente violeta-fucsia) y el nombre "AudífonosPro".
3. THE App SHALL mostrar en el header un botón "Reiniciar" que al ser presionado solicite confirmación antes de ejecutar el reset.
4. WHEN el usuario confirma el reinicio, THE App SHALL restaurar el inventario al estado inicial y mostrar el dashboard actualizado.

---

### Requisito 13: Límites RSC / Client Component

**User Story:** Como desarrollador, quiero que la frontera entre Server y Client Components esté claramente definida, para maximizar el rendimiento y evitar errores de hidratación.

#### Criterios de Aceptación

1. THE App SHALL aplicar la directiva `'use client'` únicamente a los componentes que usen hooks de React, event handlers o APIs del navegador.
2. THE App SHALL mantener como RSC puros: `app/layout.tsx`, `app/page.tsx` y cualquier componente que solo reciba props serializables y no use interactividad.
3. WHEN un componente RSC pasa props a un componente cliente, THE App SHALL asegurarse de que todas las props sean serializables (strings, numbers, booleans, plain objects, arrays).
4. THE App SHALL evitar pasar funciones como props desde RSC a componentes cliente; en su lugar, las funciones de callback SHALL definirse dentro del componente cliente.
5. IF un componente usa `localStorage`, `useState`, `useEffect` o event handlers, THEN THE App SHALL marcarlo con `'use client'` en la primera línea del archivo.

---

### Requisito 14: Rendimiento y Optimización

**User Story:** Como usuario, quiero que la app cargue rápidamente y sea fluida, para tener una experiencia de uso óptima.

#### Criterios de Aceptación

1. THE App SHALL usar `next/font` para cargar fuentes web, evitando el uso de etiquetas `<link>` manuales en el HTML.
2. THE App SHALL configurar el `RootLayout` en `app/layout.tsx` con los metadatos globales, fuentes y el `<Toaster>` de sonner.
3. THE App SHALL evitar importaciones de módulos server-only en componentes cliente y viceversa.
4. WHEN el bundle de JavaScript del cliente se analiza, THE App SHALL contener únicamente los componentes marcados con `'use client'` y sus dependencias directas.
