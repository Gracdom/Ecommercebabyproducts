# 📏 Guía: Cómo Cambiar el Tamaño del Popup

## 🎯 Ubicación del Código

El tamaño del popup se controla en el archivo:
```
src/components/ExitIntentPopup.tsx
```

## 📐 Cambiar el Ancho del Popup

### Busca esta línea (aproximadamente línea 50):

```typescript
className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[650px] mx-4"
```

### Modifica el valor `max-w-[650px]`:

```typescript
// Opciones de ancho:

// MÁS PEQUEÑO
max-w-[500px]   // 500px de ancho
max-w-[550px]   // 550px de ancho

// ACTUAL
max-w-[650px]   // 650px de ancho (actual)

// MÁS GRANDE
max-w-[700px]   // 700px de ancho
max-w-[800px]   // 800px de ancho
max-w-[900px]   // 900px de ancho

// USANDO CLASES DE TAILWIND (recomendado)
max-w-sm        // 384px (pequeño)
max-w-md        // 448px (mediano)
max-w-lg        // 512px (grande)
max-w-xl        // 576px (extra grande)
max-w-2xl       // 672px (2x grande)
max-w-3xl       // 768px (3x grande)
max-w-4xl       // 896px (4x grande)
```

## 📏 Cambiar la Altura del Popup

### Busca esta línea (aproximadamente línea 63):

```typescript
<div className="p-8 md:p-12 flex flex-col justify-center min-h-[450px]">
```

### Modifica el valor `min-h-[450px]`:

```typescript
// Opciones de altura:

// MÁS PEQUEÑO
min-h-[350px]   // 350px de alto
min-h-[400px]   // 400px de alto

// ACTUAL
min-h-[450px]   // 450px de alto (actual)

// MÁS GRANDE
min-h-[500px]   // 500px de alto
min-h-[550px]   // 550px de alto
min-h-[600px]   // 600px de alto
```

## 🎨 Cambiar el Ancho del Contenido (Columna Derecha)

### Busca esta línea (aproximadamente línea 64):

```typescript
<div className="ml-auto max-w-sm text-right">
```

### Modifica el valor `max-w-sm`:

```typescript
// Opciones de ancho del contenido:

// MÁS ESTRECHO
max-w-xs        // 320px (extra small)

// ACTUAL
max-w-sm        // 384px (small - actual)

// MÁS ANCHO
max-w-md        // 448px (medium)
max-w-lg        // 512px (large)

// PERSONALIZADO
max-w-[300px]   // 300px exactos
max-w-[400px]   // 400px exactos
max-w-[500px]   // 500px exactos
```

## 🔧 Ejemplo Práctico

### Ejemplo 1: Popup más pequeño (500px × 400px)

```typescript
// Cambiar línea del ancho:
className="... max-w-[500px] ..."

// Cambiar línea de la altura:
<div className="... min-h-[400px]">

// Cambiar línea del contenido (más estrecho):
<div className="ml-auto max-w-xs text-right">
```

### Ejemplo 2: Popup más grande (800px × 550px)

```typescript
// Cambiar línea del ancho:
className="... max-w-[800px] ..."

// Cambiar línea de la altura:
<div className="... min-h-[550px]">

// Cambiar línea del contenido (más ancho):
<div className="ml-auto max-w-md text-right">
```

### Ejemplo 3: Popup usando clases de Tailwind

```typescript
// Cambiar línea del ancho (768px):
className="... max-w-3xl ..."

// Mantener altura:
<div className="... min-h-[450px]">

// Contenido mediano (448px):
<div className="ml-auto max-w-md text-right">
```

## 📋 Tabla de Referencia Rápida

### Anchos de Tailwind

| Clase | Píxeles | Uso Recomendado |
|-------|---------|-----------------|
| `max-w-xs` | 320px | Popup muy pequeño |
| `max-w-sm` | 384px | Popup compacto |
| `max-w-md` | 448px | Popup pequeño-mediano |
| `max-w-lg` | 512px | Popup mediano |
| `max-w-xl` | 576px | Popup grande |
| `max-w-2xl` | 672px | Popup grande+ |
| `max-w-3xl` | 768px | Popup muy grande |
| `max-w-4xl` | 896px | Popup extra grande |

### Alturas Recomendadas

| Altura | Uso |
|--------|-----|
| `min-h-[350px]` | Contenido mínimo |
| `min-h-[400px]` | Compacto |
| `min-h-[450px]` | Actual (recomendado) |
| `min-h-[500px]` | Espacioso |
| `min-h-[600px]` | Muy espacioso |

## 🎯 Pasos para Cambiar el Tamaño

### Paso 1: Abre el archivo
```
src/components/ExitIntentPopup.tsx
```

### Paso 2: Busca (Ctrl+F o Cmd+F)
```
max-w-[650px]
```

### Paso 3: Cambia el valor
```typescript
// De esto:
max-w-[650px]

// A esto (ejemplo: más grande):
max-w-[800px]

// O usa clases de Tailwind:
max-w-3xl
```

### Paso 4: Guarda el archivo
```
Ctrl+S (Windows) o Cmd+S (Mac)
```

### Paso 5: Recarga el navegador
```
La aplicación se recargará automáticamente
```

## 💡 Consejos

### 1. **Proporciones Recomendadas**
```
Ancho 650px → Contenido 384px (proporción ~60%)
Ancho 800px → Contenido 448px (max-w-md)
Ancho 500px → Contenido 320px (max-w-xs)
```

### 2. **Mantén la Coherencia**
Si cambias el ancho del popup, considera ajustar también el ancho del contenido:

```typescript
// Si haces el popup más grande:
max-w-[800px]     // Popup más grande
max-w-md          // Contenido más ancho (448px)

// Si haces el popup más pequeño:
max-w-[500px]     // Popup más pequeño
max-w-xs          // Contenido más estrecho (320px)
```

### 3. **Prueba en Mobile**
El popup se adapta automáticamente en móviles con `mx-4` (margen horizontal).

## 🔍 Ubicación Exacta de las Líneas

### Ancho del Popup (Línea ~50)
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ type: 'spring', duration: 0.4 }}
  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[650px] mx-4"
                                                                                    ↑
                                                                            CAMBIA AQUÍ
  onClick={(e) => e.stopPropagation()}
>
```

### Altura y Ancho del Contenido (Línea ~63-64)
```typescript
<div className="p-8 md:p-12 flex flex-col justify-center min-h-[450px]">
                                                            ↑
                                                    ALTURA AQUÍ

  <div className="ml-auto max-w-sm text-right">
                            ↑
                   ANCHO DEL CONTENIDO
```

## 🎨 Configuraciones Populares

### Configuración 1: Compacto
```typescript
max-w-[550px]     // Popup
min-h-[400px]     // Altura
max-w-xs          // Contenido (320px)
```

### Configuración 2: Actual (Recomendado)
```typescript
max-w-[650px]     // Popup
min-h-[450px]     // Altura
max-w-sm          // Contenido (384px)
```

### Configuración 3: Grande
```typescript
max-w-3xl         // Popup (768px)
min-h-[500px]     // Altura
max-w-md          // Contenido (448px)
```

### Configuración 4: Muy Grande
```typescript
max-w-4xl         // Popup (896px)
min-h-[550px]     // Altura
max-w-lg          // Contenido (512px)
```

## 🚨 Errores Comunes

### ❌ Error 1: Olvidar los corchetes
```typescript
// MAL
max-w-650px

// BIEN
max-w-[650px]
```

### ❌ Error 2: No coincidir el estado de éxito
Recuerda cambiar **ambos**: el popup normal Y el estado de éxito (línea ~100 aprox)

### ❌ Error 3: Contenido muy ancho
Si el contenido (`max-w-sm`) es muy ancho para el popup, se verá mal.

```typescript
// MAL: Popup pequeño con contenido grande
max-w-[500px]   // Popup
max-w-lg        // Contenido demasiado ancho

// BIEN: Proporciones correctas
max-w-[500px]   // Popup
max-w-xs        // Contenido apropiado
```

## 📱 Responsive

El popup se adapta automáticamente en móviles:
- Desktop: Usa el `max-w-[XXXpx]` que definas
- Mobile: Se adapta al ancho de pantalla con `mx-4`

No necesitas cambiar nada para mobile.

## 🔄 Revertir Cambios

Si quieres volver al tamaño original:
```typescript
max-w-[650px]     // Ancho original
min-h-[450px]     // Altura original
max-w-sm          // Contenido original
```

---

## 📞 Resumen Ultra-Rápido

**Para cambiar el tamaño del popup:**

1. Abre: `src/components/ExitIntentPopup.tsx`
2. Busca: `max-w-[650px]` (línea ~50)
3. Cambia a: `max-w-[800px]` (o el tamaño que quieras)
4. Opcional - Busca: `min-h-[450px]` (línea ~63)
5. Cambia a: `min-h-[500px]` (o la altura que quieras)
6. Guarda (Ctrl+S)
7. ¡Listo! La app se recarga automáticamente

**Valores populares:**
- Pequeño: `max-w-[500px]`
- Actual: `max-w-[650px]`
- Grande: `max-w-[800px]`
- Muy grande: `max-w-3xl` (768px)

---

¡Con esta guía podrás cambiar el tamaño del popup cuando quieras! 🎉
