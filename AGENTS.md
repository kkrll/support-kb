# Agent Guidelines

## Build/Lint/Test Commands
- Dev server: `npm run dev` or `bun dev`
- Build: `npm run build` or `bun run build`
- Lint: `npm run lint` or `bun run lint`
- No test suite configured yet

## Code Style

### Imports
- Use `@/` alias for src imports (e.g., `@/lib/utils`, `@/components/ui/button`)
- Group imports: external packages first, then internal modules

### TypeScript
- Strict mode enabled - always provide explicit types for function parameters and return values
- Use interfaces for data structures (see `src/lib/types.ts`)
- No `any` types - use proper typing or `unknown` with type guards

### Formatting & Naming
- Use double quotes for strings
- Use function keyword for React components and named functions
- camelCase for variables/functions, PascalCase for components/types
- Destructure props in component signatures

### Error Handling
- Use async/await, avoid raw Promises
- Handle errors gracefully in API routes

### React/Next.js
- Use "use client" directive for client components
- Server components by default
- API routes in `src/app/api/` following Next.js 16 App Router conventions
