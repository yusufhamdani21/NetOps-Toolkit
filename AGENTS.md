# NetOps Toolkit - Agent Guide

## Build Commands
- `npm run dev` - Start Vite dev server
- `npm run build` - TypeScript check + Vite production build
- `npm run tauri:dev` - Start Tauri development mode
- `npm run tauri:build` - Build Tauri application (requires system deps)
- `npm run lint` - Run ESLint
- `npm run format` - Run Prettier
- `npm test` - Run Vitest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Architecture
- **Frontend**: Vue 3 + TypeScript + TailwindCSS + Pinia + Vue Router
- **Backend**: Tauri v2 (Rust)
- **Services**: Each service has a browser-mock mode and calls Tauri invoke() when running in Tauri context
- **Stores**: Pinia stores for dashboard, theme, toast, logger, device tests, incident reports

## Project Structure
- `src/` - Vue 3 frontend
  - `components/` - UI components (common, layout, per-module)
  - `composables/` - Vue composables
  - `services/` - Service layer (calls Tauri or uses mock data)
  - `stores/` - Pinia stores
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions (icons)
  - `views/` - Page-level components
- `src-tauri/` - Rust backend
  - `src/commands/` - Tauri command handlers
  - `src/services/` - Rust service implementations

## TypeScript
- Strict mode enabled
- Path alias `@/` maps to `src/`
- Window interface extended for `__TAURI_INTERNALS__`

## Adding New Modules
1. Add types in `src/types/index.ts`
2. Create service in `src/services/`
3. Create view in `src/views/`
4. Add route in `src/router/index.ts`
5. Create optional Rust commands in `src-tauri/src/commands/`
6. Register commands in `src-tauri/src/lib.rs`
