# Ecom Shopcard Backend (NestJS + TypeORM + PostgreSQL)

## Stack
- Node.js + NestJS + TypeScript
- PostgreSQL + TypeORM
- JWT Access/Refresh Token
- Zod Validation
- Winston Logging
- Swagger: `/docs`

## Setup
1. Install dependencies:
```bash
npm install
```

2. Copy env:
```bash
cp .env.example .env
```

3. Create database schema (from project root):
```bash
psql -U postgres -d ecom_shopcard -f ../.schema
```

4. Run in dev:
```bash
npm run start:dev
```

5. Build production:
```bash
npm run build
npm run start:prod
```

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

`register/login/refresh` trả về `access_token` và `refresh_token`.

## Swagger
- URL: `http://localhost:3000/docs`

## Notes
- Profile và Wishlist yêu cầu JWT.
- Catalog, mẫu sản phẩm và bảng giá dùng cho mục đích tham khảo/tư vấn.
