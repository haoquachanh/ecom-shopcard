# Admin API Requirements

Admin Electron app uses the existing backend when endpoints are available. The current backend exposes auth/profile and public catalog read APIs, but admin CRUD/list APIs are missing.

## Already Available

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /profile`
- `GET /product-types`
- `GET /product-types/:id`
- `GET /samples?product_type_id=`
- `GET /samples/:id`
- `POST /price/calculate`

## Required For Production Admin

All endpoints below should require JWT auth and an admin role guard.

### Health

- `GET /health`
  - Return API/database status, app version, uptime.

### Users

- `GET /admin/users?search=&status=&page=&pageSize=`
  - Return `{ items, total, page, pageSize }`.
- `GET /admin/users/:id`
  - Return user detail without password hash.
- `PATCH /admin/users/:id/status`
  - Body: `{ "isActive": boolean }`.
  - Prefer status/soft-disable. Do not hard-delete users by default.

### Product Types

- `POST /admin/product-types`
- `PUT /admin/product-types/:id`
- `PATCH /admin/product-types/:id/status`

Suggested fields: `name`, `description`, `imageUrl`, `isActive`, `sortOrder`.

### Samples

- `POST /admin/samples`
- `PUT /admin/samples/:id`
- `PATCH /admin/samples/:id/status`

Suggested fields: `productTypeId`, `name`, `description`, `imageUrl`, `isActive`.

### Pricing/Data Management

Entities present in backend include `base_prices`, `quantity_tiers`, `materials`, `sizes`, `sides`, `effects`.

Recommended endpoints:

- `GET /admin/price/base-prices?productTypeId=`
- `POST /admin/price/base-prices`
- `PUT /admin/price/base-prices/:id`
- `PATCH /admin/price/base-prices/:id/status`
- `GET /admin/price/quantity-tiers?productTypeId=`
- `POST /admin/price/quantity-tiers`
- `PUT /admin/price/quantity-tiers/:id`
- `GET /admin/price/materials`
- `POST /admin/price/materials`
- `PUT /admin/price/materials/:id`
- `GET /admin/price/sizes`
- `POST /admin/price/sizes`
- `PUT /admin/price/sizes/:id`
- `GET /admin/price/sides`
- `GET /admin/price/effects`

## Notes

- Do not expose password hashes in admin responses.
- Use pagination for all list endpoints.
- Return consistent response shape, preferably `{ success: true, data }` or plain JSON consistently.
- Keep destructive operations as status changes unless there is a confirmed hard-delete requirement.
