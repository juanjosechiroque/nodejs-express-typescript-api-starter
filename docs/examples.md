# API Examples

Set the API base URL once before running the examples:

```bash
BASE_URL=http://localhost:3000
```

The examples use `jq` to read JSON values. The request and response schemas, including every
header and status code, are defined in [openapi.yaml](../openapi.yaml).

## Health and public Product reads

```bash
curl --fail --silent --show-error "$BASE_URL/v1/health"
```

```bash
# List active featured products
curl --get "$BASE_URL/v1/products" \
    --data-urlencode "status=active" \
    --data-urlencode "isFeatured=true"
```

```bash
# `isFeatured=false` is a boolean filter, not the string "true".
curl --get "$BASE_URL/v1/products" \
    --data-urlencode "isFeatured=false"
```

```bash
# Fetch the next page by passing a cursor returned in data.pagination.nextCursor.
curl --get "$BASE_URL/v1/products" \
    --data-urlencode "limit=10" \
    --data-urlencode "cursor=PRODUCT_CURSOR"
```

```bash
curl "$BASE_URL/v1/products/PRODUCT_ID"
```

Replace `PRODUCT_ID` and `PRODUCT_CURSOR` with values returned by the API.

## Authentication

```bash
EMAIL="demo-user-$(date +%s)@example.com"
PASSWORD='DemoPassword123!'

curl --silent --show-error -X POST "$BASE_URL/v1/auth/signup" \
    -H "Content-Type: application/json" \
    --data "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
```

```bash
TOKEN=$(curl --silent --show-error -X POST "$BASE_URL/v1/auth/login" \
    -H "Content-Type: application/json" \
    --data "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
    | jq -r '.data')
```

The Product write examples below require that `TOKEN` is a successful login response.

## Create and update a Product

```bash
PRODUCT_ID=$(curl --silent --show-error -X POST "$BASE_URL/v1/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    --data '{"name":"Starter Tee","price":29.99,"stock":50,"status":"draft"}' \
    | jq -r '.data.id')
```

```bash
# PATCH changes only the fields supplied in the request body.
curl --silent --show-error -X PATCH "$BASE_URL/v1/products/$PRODUCT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    --data '{"isFeatured":true,"stock":40}'
```

```bash
# An active product must be archived before it can be deleted.
curl --silent --show-error -X PATCH "$BASE_URL/v1/products/$PRODUCT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    --data '{"status":"archived"}'

curl --silent --show-error -X DELETE "$BASE_URL/v1/products/$PRODUCT_ID" \
    -H "Authorization: Bearer $TOKEN"
```

## Error examples

```bash
# Validation error: price must be positive.
curl --silent -X POST "$BASE_URL/v1/products" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    --data '{"name":"Invalid product","price":0}'
```

```bash
# Authentication error: protected routes require a Bearer token.
curl --silent -X POST "$BASE_URL/v1/products" \
    -H "Content-Type: application/json" \
    --data '{"name":"Unauthorized product","price":10}'
```

```bash
# Invalid request IDs are replaced with a generated UUID before logging and responding.
curl --include "$BASE_URL/v1/health" \
    -H "x-request-id: request id with spaces"
```

## Rate-limit headers

Successful responses include `RateLimit` and `RateLimit-Policy` when rate limiting is enabled.
Use `--include` to inspect them:

```bash
curl --include "$BASE_URL/v1/products"
```
