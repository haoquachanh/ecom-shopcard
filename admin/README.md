# ShopCard Admin Desktop

Electron + React + TypeScript admin app for managing the online ShopCard database through the existing backend API.

## Run Locally

```bash
cd admin
npm install
cp .env.example .env
npm run dev
```

Default API URL is `http://localhost:3000`. You can change it inside **Settings** in the desktop app.

## Scripts

- `npm run dev` - start Vite and Electron.
- `npm run build` - typecheck/build Electron main, preload, and renderer.
- `npm run start` - build then launch Electron.
- `npm run typecheck` - TypeScript checks only.

## Architecture

- `electron/main.ts` owns the desktop window, local settings, and encrypted token storage.
- `electron/preload.ts` exposes a small `window.adminNative` API via `contextBridge`.
- `src/features/*` contains feature pages and domain logic.
- `src/shared/api` contains the reusable API client and backend adapters.
- `src/shared/components` contains small app-level UI primitives.
- `src/shared/layouts/AdminLayout.tsx` defines sidebar, topbar, and content shell.

Renderer does not call Node APIs directly. Tokens are requested through preload and stored by the main process.

## Backend Coverage

The current backend supports:

- login/refresh/logout
- current profile
- read product types
- read samples
- price calculation

Admin CRUD/user management endpoints are listed in `ADMIN_API_REQUIREMENTS.md`.
