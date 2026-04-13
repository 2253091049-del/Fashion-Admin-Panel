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

## Last Portion: Products Not Saving -> Fixed

### Problem Reported
- In the Products section, adding/updating products was not being saved reliably.
- After app restart, newly added products were missing in some runs.

### Root Cause
- The backend persistence layer had already been moved to SQLite, but in packaged desktop runs the backend process sometimes failed to load the native `better-sqlite3` binding.
- When native sqlite binding is missing, DB operations fail at runtime, so Product create/update calls do not persist.
- In addition, product route handling needed sqlite-safe parsing/typing so payload values map cleanly into sqlite columns.

### What I Changed (Exact Work Done)
1. Database layer switched and stabilized for SQLite:
	- Replaced PostgreSQL-oriented schema usage with sqlite-core schema in shared DB package.
	- Updated DB client usage to `better-sqlite3` and ensured DB/tables initialize on startup.
2. Product API route hardening:
	- Updated product route logic to parse request values in SQLite-compatible way.
	- Ensured insert/update payload handling matches sqlite column expectations.
3. Desktop packaging/runtime fixes for DB availability:
	- Rebuilt `better-sqlite3` against Electron runtime.
	- Copied rebuilt native sqlite package into packaged backend `node_modules`.
	- Copied helper deps required by sqlite binding resolution.
	- Started backend with `NODE_PATH` configured so packaged module resolution works.
4. Build toolchain setup required for native sqlite:
	- Installed Python and Visual Studio Build Tools (C++ workload + Windows SDK).
	- Reason: `node-gyp` must compile Electron-targeted native addon (`better-sqlite3`), otherwise DB binary is missing and save fails.

### Why Visual Studio Installer Was Needed
- `better-sqlite3` is a native Node module.
- For Electron, prebuilt binaries are not always usable for your exact Electron/Node ABI combination.
- Native rebuild uses `node-gyp`, which requires:
  - Python
  - MSVC C++ toolchain (from Visual Studio Build Tools)
  - Windows SDK
- Without this toolchain, sqlite native binding is not produced, backend DB open fails, and Products save cannot persist.

### How Products Save Now (Working Flow)
1. UI sends Product create/update request to backend.
2. Backend `products` route validates/parses data for sqlite-safe values.
3. Drizzle executes insert/update on local SQLite DB file.
4. DB file is stored under AppData (persistent across app restarts).
5. Products list fetch reads the same SQLite records, so saved products remain visible after restart.

### Database Working State (Current)
- Backend starts successfully with SQLite in desktop packaged mode.
- Native sqlite binding is present and loadable.
- Product insert/update operations persist to local DB.
- Data remains after app restart because storage is file-based SQLite in AppData.

### Verification Checklist Used
- Added a new product -> appears immediately in list.
- Restarted app -> product still exists.
- Edited existing product -> changes persisted after refresh/restart.
- Confirmed backend process starts without sqlite binding error in logs.
