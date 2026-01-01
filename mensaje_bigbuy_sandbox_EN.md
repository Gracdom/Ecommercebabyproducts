# Sandbox API Issue - Product Endpoints

Dear BigBuy Team,

I am writing to report a persistent issue with your sandbox API environment. We have conducted multiple tests and all product-related endpoints are returning 500 (Internal Server Error) errors.

## Problem Summary

**Sandbox API Key:** `OTgxMjkzODA2ODI5ZTlkYWI0ZGU2MmRlYWI5MWM0YzA3ZjJmYWNlMmZlZWExMmFmNjczZjBiNjI2ZmIxMDIyMQ`

**Base URL:** `https://api.sandbox.bigbuy.eu`

## Endpoints Working Correctly ✅

- `/rest/catalog/taxonomies.json` - Works perfectly, we get 24 first-level taxonomies

## Endpoints Failing with 500 Error ❌

All the following endpoints consistently return 500 errors:

1. `/rest/catalog/products.json`
2. `/rest/catalog/productsinformation.json`
3. `/rest/catalog/productsimages.json`
4. `/rest/catalog/productsvariations.json`
5. `/rest/catalog/productsvariationsstockbyhandlingdays.json`
6. `/rest/catalog/productsstockbyhandlingdays.json`
7. `/rest/catalog/attributes.json`
8. `/rest/catalog/attributegroups.json`

## Case IDs Generated

We have collected the following case IDs from the errors:

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

## Request Examples

### Example 1: Products without parameters
```bash
GET https://api.sandbox.bigbuy.eu/rest/catalog/products.json
Headers:
  Authorization: Bearer OTgxMjkzODA2ODI5ZTlkYWI0ZGU2MmRlYWI5MWM0YzA3ZjJmYWNlMmZlZWExMmFmNjczZjBiNjI2ZmIxMDIyMQ
  Accept: application/json

Response:
{
  "code": 500,
  "message": "An error has occurred. Please try again later. The team has been notify with case id: 243fd9e1bf71473d99963845e5de3a94"
}
```

### Example 2: Products with parameters
```bash
GET https://api.sandbox.bigbuy.eu/rest/catalog/products.json?pageSize=5&parentTaxonomy=19649
Headers:
  Authorization: Bearer OTgxMjkzODA2ODI5ZTlkYWI0ZGU2MmRlYWI5MWM0YzA3ZjJmYWNlMmZlZWExMmFmNjczZjBiNjI2ZmIxMDIyMQ
  Accept: application/json

Response:
{
  "code": 500,
  "message": "An error has occurred. Please try again later. The team has been notify with case id: d61d8dd2401f4745b1be68568abc3743"
}
```

### Example 3: ProductsInformation
```bash
GET https://api.sandbox.bigbuy.eu/rest/catalog/productsinformation.json?isoCode=es&pageSize=5
Headers:
  Authorization: Bearer OTgxMjkzODA2ODI5ZTlkYWI0ZGU2MmRlYWI5MWM0YzA3ZjJmYWNlMmZlZWExMmFmNjczZjBiNjI2ZmIxMDIyMQ
  Accept: application/json

Response:
{
  "code": 500,
  "message": "An error has occurred. Please try again later. The team has been notify with case id: 2bb0b433272f4540bb3d0b81879f7f83"
}
```

## Verifications Performed

1. ✅ **Valid authentication**: The taxonomies endpoint works correctly, confirming that the API key is valid and authentication works.

2. ✅ **Correct request format**: We tested with different variations:
   - Without parameters
   - With `pageSize` only
   - With `page` and `pageSize`
   - With `parentTaxonomy` and `pageSize`
   - With `isoCode` and `pageSize`
   All return the same 500 error.

3. ✅ **Correct headers**: We use standard headers:
   - `Authorization: Bearer {API_KEY}`
   - `Accept: application/json`

4. ✅ **Production comparison**: We tested with the production API (`https://api.bigbuy.eu`) and it works correctly (though it requires a different API key, as expected).

## Impact

This issue prevents us from:
- Developing and testing the product catalog integration
- Syncing products from the sandbox
- Testing product variations
- Obtaining product information
- Obtaining product images
- Verifying product stock

## Request

Could you please:
1. Investigate these case IDs and verify what is causing the 500 errors in the sandbox?
2. Confirm if there are any restrictions or additional configuration needed to access product endpoints in the sandbox?
3. Inform us when the issue is resolved so we can continue with our development?

## Contact Information

If you need additional information or access to more detailed logs, I will be happy to provide it.

Thank you for your attention and we look forward to your response.

---
Date: December 28, 2025
Project: Ecommerce Baby Products

