# Plan de Tareas: Migración Vite → Next.js 15

## Tareas

- [x] 1. Inicializar proyecto Next.js 15
  - [x] 1.1 Crear el proyecto con `pnpm create next-app@latest` usando App Router, TypeScript y Tailwind CSS v3
  - [x] 1.2 Instalar dependencias de producción: `framer-motion`, `sonner`, `lucide-react` y todas las dependencias de shadcn/ui del proyecto original
  - [x] 1.3 Configurar el alias `@/` apuntando a `./src` en `tsconfig.json`
  - [x] 1.4 Configurar `darkMode: 'class'` en `tailwind.config.ts`
  - [x] 1.5 Inicializar shadcn/ui con `pnpm dlx shadcn@latest init` y agregar los componentes `button`, `input` y `label`

- [x] 2. Crear estructura Screaming Architecture
  - [x] 2.1 Crear los directorios `src/inventory/hooks/`, `src/inventory/components/` y `src/shared/components/`
  - [x] 2.2 Eliminar la estructura de carpetas por tipo de archivo generada por el scaffolding de Next.js que no corresponda a la arquitectura objetivo

- [x] 3. Migrar tipos y constantes del dominio
  - [x] 3.1 Crear `src/inventory/types.ts` con `ColorType`, `Transaction`, `InventoryState` y `COLOR_CONFIG` copiados desde `src/types/index.ts`

- [x] 4. Migrar el hook de inventario
  - [x] 4.1 Crear `src/inventory/hooks/use-inventory.ts` con la directiva `'use client'` en la primera línea
  - [x] 4.2 Copiar la lógica de `src/hooks/useInventory.ts` actualizando las importaciones a `@/inventory/types`
  - [x] 4.3 Mover la llamada a `confirm()` fuera del hook: `resetInventory()` en el hook solo hace el reset sin confirmación

- [x] 5. Migrar componentes del dominio de inventario
  - [x] 5.1 Crear `src/inventory/components/color-card.tsx` con `'use client'` e importaciones actualizadas
  - [x] 5.2 Crear `src/inventory/components/entry-form.tsx` con `'use client'` e importaciones actualizadas
  - [x] 5.3 Crear `src/inventory/components/exit-form.tsx` con `'use client'` e importaciones actualizadas
  - [x] 5.4 Crear `src/inventory/components/stats-card.tsx` con `'use client'` e importaciones actualizadas
  - [x] 5.5 Crear `src/inventory/components/transaction-history.tsx` con `'use client'` e importaciones actualizadas

- [x] 6. Crear componentes compartidos
  - [x] 6.1 Crear `src/shared/components/animated-background.tsx` con `'use client'` extrayendo los tres orbs y el grid pattern del `App.tsx` original
  - [x] 6.2 Crear `src/shared/components/app-header.tsx` con `'use client'` extrayendo el header del `App.tsx` original; recibe `onReset: () => void` y llama a `confirm()` antes de ejecutarlo

- [x] 7. Crear el componente orquestador InventoryDashboard
  - [x] 7.1 Crear `src/inventory/components/inventory-dashboard.tsx` con `'use client'`
  - [x] 7.2 Mover la lógica de `App.tsx` (useInventory, handleEntry, handleExit, spinner de carga) a este componente
  - [x] 7.3 Componer `AnimatedBackground`, `AppHeader`, stats grid, color grid, formularios e historial dentro de este componente

- [x] 8. Configurar App Router
  - [x] 8.1 Crear `src/app/layout.tsx` como RSC con `next/font` (Inter), clase `dark` en `<html>`, `bg-gray-950` en `<body>` y `<Toaster>` de sonner con `theme="dark"` y estilos de glassmorphism
  - [x] 8.2 Crear `src/app/page.tsx` como RSC que solo renderiza `<InventoryDashboard />`
  - [x] 8.3 Mover o crear `src/app/globals.css` con las directivas de Tailwind y los estilos base del proyecto original

- [x] 9. Verificar y corregir la migración
  - [x] 9.1 Verificar que no haya errores de TypeScript en ningún archivo migrado
  - [x] 9.2 Verificar que todos los componentes que usan hooks, event handlers o APIs del browser tengan `'use client'`
  - [x] 9.3 Verificar que `app/layout.tsx` y `app/page.tsx` no tengan `'use client'`
  - [x] 9.4 Verificar que no se pasen funciones como props desde RSC a componentes cliente
  - [x] 9.5 Ejecutar `pnpm build` y confirmar que el build de producción completa sin errores
