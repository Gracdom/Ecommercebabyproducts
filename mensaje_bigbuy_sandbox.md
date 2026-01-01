# Problema con Sandbox API - Endpoints de Productos

Estimado equipo de BigBuy,

Les escribo para reportar un problema persistente con el entorno sandbox de su API. Hemos realizado múltiples pruebas y todos los endpoints relacionados con productos están devolviendo errores 500 (Internal Server Error).

## Resumen del Problema

**API Key de Sandbox:** `OTgxMjkzODA2ODI5ZTlkYWI0ZGU2MmRlYWI5MWM0YzA3ZjJmYWNlMmZlZWExMmFmNjczZjBiNjI2ZmIxMDIyMQ`

**Base URL:** `https://api.sandbox.bigbuy.eu`

## Endpoints que Funcionan Correctamente ✅

- `/rest/catalog/taxonomies.json` - Funciona perfectamente, obtenemos 24 taxonomías de nivel 1

## Endpoints que Fallan con Error 500 ❌

Todos los siguientes endpoints devuelven consistentemente error 500:

1. `/rest/catalog/products.json`
2. `/rest/catalog/productsinformation.json`
3. `/rest/catalog/productsimages.json`
4. `/rest/catalog/productsvariations.json`
5. `/rest/catalog/productsvariationsstockbyhandlingdays.json`
6. `/rest/catalog/productsstockbyhandlingdays.json`
7. `/rest/catalog/attributes.json`
8. `/rest/catalog/attributegroups.json`

## Case IDs Generados

Hemos recopilado los siguientes case IDs de los errores:

- `243fd9e1bf71473d99963845e5de3a94`
- `ca46ef651522480c94614c924291af6f`
- `d87167c7465b4e3ba4fb96af9f795fb1`
- `d61d8dd2401f4745b1be68568abc3743`
- `2bb0b433272f4540bb3d0b81879f7f83`
- `dbb38858558243428d2fb535b15c376a`
- `cd172cb5652e49a4a4bd866765010a4e`
- `fef36799fbed471891138b3eab4c1ed6`
- `168db46ea5354e4d9008adc8d6543e23`
- `9c468e6749af4d11bc0e181e5e82d0d6`
- `71efa58013414de89b1a2c5ae9d9fa4a`
- `6c7d9c76b4c1431aad0ba1c21cd44ca1`
- `6b620a71556f42eab8e085597d4723d5`

## Ejemplos de Peticiones Realizadas

### Ejemplo 1: Products sin parámetros
```bash
GET https://api.sandbox.bigbuy.eu/rest/catalog/products.json
Headers:
  Authorization: Bearer OTgxMjkzODA2ODI5ZTlkYWI0ZGU2MmRlYWI5MWM0YzA3ZjJmYWNlMmZlZWExMmFmNjczZjBiNjI2ZmIxMDIyMQ
  Accept: application/json

Respuesta:
{
  "code": 500,
  "message": "An error has occurred. Please try again later. The team has been notify with case id: 243fd9e1bf71473d99963845e5de3a94"
}
```

### Ejemplo 2: Products con parámetros
```bash
GET https://api.sandbox.bigbuy.eu/rest/catalog/products.json?pageSize=5&parentTaxonomy=19649
Headers:
  Authorization: Bearer OTgxMjkzODA2ODI5ZTlkYWI0ZGU2MmRlYWI5MWM0YzA3ZjJmYWNlMmZlZWExMmFmNjczZjBiNjI2ZmIxMDIyMQ
  Accept: application/json

Respuesta:
{
  "code": 500,
  "message": "An error has occurred. Please try again later. The team has been notify with case id: d61d8dd2401f4745b1be68568abc3743"
}
```

### Ejemplo 3: ProductsInformation
```bash
GET https://api.sandbox.bigbuy.eu/rest/catalog/productsinformation.json?isoCode=es&pageSize=5
Headers:
  Authorization: Bearer OTgxMjkzODA2ODI5ZTlkYWI0ZGU2MmRlYWI5MWM0YzA3ZjJmYWNlMmZlZWExMmFmNjczZjBiNjI2ZmIxMDIyMQ
  Accept: application/json

Respuesta:
{
  "code": 500,
  "message": "An error has occurred. Please try again later. The team has been notify with case id: 2bb0b433272f4540bb3d0b81879f7f83"
}
```

## Verificaciones Realizadas

1. ✅ **Autenticación válida**: El endpoint de taxonomías funciona correctamente, confirmando que la API key es válida y la autenticación funciona.

2. ✅ **Formato de petición correcto**: Hemos probado con diferentes variaciones:
   - Sin parámetros
   - Con `pageSize` solamente
   - Con `page` y `pageSize`
   - Con `parentTaxonomy` y `pageSize`
   - Con `isoCode` y `pageSize`
   Todos devuelven el mismo error 500.

3. ✅ **Headers correctos**: Usamos los headers estándar:
   - `Authorization: Bearer {API_KEY}`
   - `Accept: application/json`

4. ✅ **Comparación con producción**: Probamos con la API de producción (`https://api.bigbuy.eu`) y funciona correctamente (aunque requiere una API key diferente, como es esperado).

## Impacto

Este problema nos impide:
- Desarrollar y probar la integración con el catálogo de productos
- Sincronizar productos desde el sandbox
- Probar variaciones de productos
- Obtener información de productos
- Obtener imágenes de productos
- Verificar stock de productos

## Solicitud

Por favor, ¿podrían:
1. Investigar estos case IDs y verificar qué está causando los errores 500 en el sandbox?
2. Confirmar si hay alguna restricción o configuración adicional necesaria para acceder a los endpoints de productos en el sandbox?
3. Informarnos cuando el problema esté resuelto para poder continuar con nuestro desarrollo?

## Información de Contacto

Si necesitan información adicional o acceso a logs más detallados, estaré encantado de proporcionarla.

Gracias por su atención y esperamos su respuesta.

---
Fecha: 28 de diciembre de 2025
Proyecto: Ecommerce Baby Products

