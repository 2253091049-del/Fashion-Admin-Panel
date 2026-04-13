# Chat Summary

## Overview
- Goal: Convert the SD Fashion Admin app into a standalone Windows installer (.exe) with local SQLite storage and working UI.
- Workspace: Monorepo with frontend (artifacts/sd-fashion), backend (artifacts/api-server), desktop shell (artifacts/desktop-shell), and shared libs.

## Major Fixes and Changes

### Frontend runtime stability
- Added defensive Array.isArray checks in frontend pages to avoid .map/.reduce/.filter crashes.

### Database migration (PostgreSQL -> SQLite)
- Switched Drizzle schema from pg-core to sqlite-core.
- Replaced pg driver with better-sqlite3.
- Auto-create SQLite file and tables on startup.

### API server updates
- Added backup/restore endpoints and UI hooks.
- Adjusted routes for SQLite-compatible types.

### Electron desktop shell
- Created artifacts/desktop-shell with electron-builder.
- Added single-instance lock to prevent multiple windows.
- Fixed packaged file path resolution for frontend/back-end.
- Added detailed logging to userData for startup/frontend/backend errors.

### Packaging and build fixes
- Fixed Vite base path for file:// builds.
- Corrected path to index.html in packaged app.
- Avoided recursive packaging by splitting build output.
- Ensured packaged assets are copied into a local packaged folder.
- Switched to hash-based routing for file:// to avoid 404s.

### SQLite native module and backend startup
- Discovered packaged backend failing due to better-sqlite3 missing native binary.
- Installed Python and Visual Studio Build Tools (C++ workload + SDK).
- Rebuilt better-sqlite3 for Electron.
- Copied rebuilt better-sqlite3 and helper deps into packaged backend node_modules.
- Set NODE_PATH when spawning backend process.
- Disabled electron-builder native rebuild to avoid python requirement during packaging.

## UI Tweaks
- Removed Amount column and line item amount (BDT 0.00) from New Sale item list and receipt preview.
- Added date picker next to search in Sales History for date filtering.

## Key Files Edited
- artifacts/sd-fashion/src/pages/Dashboard.tsx (array guards)
- artifacts/sd-fashion/src/pages/NewSale.tsx (Amount column removal)
- artifacts/sd-fashion/src/pages/SalesHistory.tsx (date filter)
- artifacts/sd-fashion/src/pages/Products.tsx (save flow checks)
- artifacts/sd-fashion/src/App.tsx (hash routing on file protocol)
- artifacts/sd-fashion/vite.config.ts (base path / proxy settings)
- artifacts/sd-fashion/src/components/Layout.tsx (backup/restore UI)
- artifacts/api-server/src/routes/backup.ts (backup/restore)
- artifacts/api-server/src/routes/products.ts (sqlite-safe parsing)
- artifacts/api-server/build.mjs (sqlite externalization toggles)
- lib/db/src/index.ts (sqlite init)
- lib/db/src/schema/*.ts (sqlite tables)
- artifacts/desktop-shell/src/main.ts (paths, logs, backend spawn env)
- artifacts/desktop-shell/electron-builder.yml (packaging layout)
- artifacts/desktop-shell/package.json (scripts, deps, packaging copy)

## Build/Installer Output
- Latest installer: artifacts/desktop-shell/dist/SD Fashion Admin Setup 0.1.0.exe
- Expected size around 110+ MB after native module inclusion.

## Build Steps (handoff)
1. Ensure Python 3.12 and VS Build Tools (C++ + Windows SDK) are installed.
2. Rebuild sqlite native addon for Electron (already done in this workspace).
3. Run: pnpm --filter @workspace/desktop-shell dist
4. Installer output: artifacts/desktop-shell/dist/SD Fashion Admin Setup 0.1.0.exe

## New PC Build Prerequisites
- Node.js (v22.x used here)
- pnpm (workspace package manager)
- Python 3.12 (required for node-gyp)
- Visual Studio Build Tools 2022
	- Desktop development with C++ workload
	- Windows SDK (10/11)
- Git (optional, for cloning)

## New PC Setup Checklist
1. Install Node.js v22.x
2. Install pnpm: npm install -g pnpm
3. Install Python 3.12
4. Install VS Build Tools 2022 (C++ workload + Windows SDK)
5. From repo root:
	 - pnpm install
	 - pnpm --filter @workspace/desktop-shell dist

## Key Build Commands
- Frontend only: pnpm --filter @workspace/sd-fashion build
- API only: pnpm --filter @workspace/api-server build
- Desktop installer: pnpm --filter @workspace/desktop-shell dist

## Runtime Paths
- SQLite DB: %APPDATA%\@workspace\desktop-shell\fashion-admin.sqlite
- Logs: %APPDATA%\@workspace\desktop-shell\startup-error.log
				 %APPDATA%\@workspace\desktop-shell\frontend-load-error.log
				 %APPDATA%\@workspace\desktop-shell\backend-error.log

## Environment Variables Used
- SQLITE_DB_PATH: overrides DB file path
- PORT: backend port (default 3001)
- NODE_PATH: set in Electron spawn to resolve packaged node_modules

## Troubleshooting Quick Notes
- Blank screen: check frontend-load-error.log
- Backend not starting: check backend-error.log (better-sqlite3 missing)
- 404 in packaged app: hash routing enabled for file://
- Native sqlite build fails: ensure VS Build Tools isComplete=1 via vswhere

## Rebuild Native SQLite (if needed)
- Command (run from repo root):
	- node node_modules/.pnpm/node-gyp@11.5.0/node_modules/node-gyp/bin/node-gyp.js rebuild --target=37.10.3 --dist-url=https://electronjs.org/headers --arch=x64 --runtime=electron --python=C:\Users\<User>\AppData\Local\Programs\Python\Python312\python.exe --directory=artifacts/desktop-shell/node_modules/better-sqlite3
- Ensure VS Build Tools shows isComplete: 1 via vswhere.

## Files Removed (non-essential)
- .replit (deleted)
- .replitignore (deleted)

## Safe Cleanup (if space needed)
- artifacts/desktop-shell/build
- artifacts/desktop-shell/packaged
- artifacts/api-server/dist
- artifacts/sd-fashion/dist
- Keep artifacts/desktop-shell/dist if you want to preserve the latest installer.

## Why Product Save Failed (root cause)
- Packaged backend could not load better-sqlite3 native binding (missing .node).
- Resolved by rebuilding better-sqlite3 for Electron and copying the rebuilt package into packaged/api-server/node_modules.
- Packaging copies helper deps (bindings, file-uri-to-path) into packaged backend.

## Runtime Logs (AppData)
- Location: %APPDATA%\@workspace\desktop-shell
- Files: startup-error.log, frontend-load-error.log, backend-error.log

## Handoff Summary (for another agent)
- Packaging uses a local packaged folder copied into resources/packaged.
- Backend started via Electron with NODE_PATH set to resolve packaged node_modules.
- Hash-based routing is enabled for file:// to prevent 404s.
- better-sqlite3 is bundled by copying the rebuilt package (with .node) into packaged/api-server/node_modules.
- electron-builder rebuild is disabled (npmRebuild=false) to avoid node-gyp during packaging.

## Notes
- Backend uses local SQLite file stored in user AppData folder.
- Installer now includes all required assets and native sqlite binary.
- Hash routing fixes 404 in packaged app.
