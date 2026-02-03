
# e-baby | Ecommerce de Productos para Bebé

Ecommerce desarrollado con React + TypeScript + Vite, integrado con BigBuy para la gestión de productos y Supabase como backend.

## 🚀 Características

- Catálogo de productos sincronizado con BigBuy API
- Carrito de compras y wishlist
- Sistema de autenticación con Supabase
- Analytics de productos con ML scoring
- Descripciones generadas con IA (OpenAI)
- Diseño responsive y moderno
- Tema personalizado con colores e-baby (#83b5b6)

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- API Key de BigBuy (opcional, para sincronización)

## 🛠️ Instalación

```bash
npm install
```

## ▶️ Ejecutar en desarrollo

```bash
npm run dev
```

Por defecto corre en `http://localhost:6556` (puedes cambiar con `VITE_PORT` o `PORT`).

## 🔧 Configuración

1. Configura las variables de entorno de Supabase en `.env.local`:
   ```
   VITE_SUPABASE_URL=tu_url_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   ```

2. Para sincronizar productos de BigBuy, configura las credenciales en Supabase Edge Functions o variables de entorno.

## 📦 Build para producción

```bash
npm run build
```

## 🏗️ Estructura del proyecto

- `src/components/` - Componentes React
- `src/supabase/` - Funciones Edge y migraciones
- `src/utils/` - Utilidades y helpers
- `public/` - Assets estáticos (logo, etc.)

## 📄 Licencia

Este proyecto es privado y pertenece a Gracdom.
  