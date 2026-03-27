# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native event calendar component library (`@sunsama/event-calendar`) built for the Sunsama mobile app. Supports gesture-based interactions (tap, pinch, drag, long-press), timezone-aware rendering, and collision-based event layout.

## Common Commands

```sh
yarn install --immutable    # Install dependencies (immutable lockfile)
yarn test                   # Run all Jest tests
yarn test --maxWorkers=2    # Run tests (CI mode)
yarn lint                   # ESLint + Prettier checks
yarn lint --fix             # Auto-fix lint issues
yarn typecheck              # TypeScript type checking
yarn prepare                # Build library with react-native-builder-bob
yarn example                # Start example Expo app
```

Run a single test file:
```sh
yarn test src/utils/__tests___/compute-positioning.test.ts
```

## Architecture

**Entry point**: `src/index.tsx` — exports the `EventCalendar` component (forwardRef) with imperative methods (`scrollToTime`, `startEditMode`, `endEditMode`, `setZoomLevel`).

**State management** uses React Context:
- `ConfigProvider` (`utils/globals.ts`) — calendar configuration
- `EventsContext` (`hooks/use-events.tsx`) — event data and computed layouts
- `IsEditingContext` (`hooks/use-is-editing.tsx`) — edit mode state and callbacks
- `ZoomProvider` (`components/zoom-provider.tsx`) — pinch-to-zoom via reanimated shared values

**Event layout engine** (`utils/generate-event-layouts.ts`) — core algorithm that computes event positioning with collision detection, sorting by start time → duration → ID for deterministic ordering.

**Animation**: Uses `react-native-reanimated` shared values and `react-native-gesture-handler` for gesture-driven interactions.

**Key dependencies**: `moment-timezone` for dates, `immer` for immutable state updates, `lodash` for utilities.

## Code Conventions

- **Formatting**: Double quotes, 2-space indent, trailing commas (es5), no tabs
- **Commits**: Conventional commits enforced by commitlint (`fix:`, `feat:`, `refactor:`, `chore:`, etc.)
- **Pre-commit hooks** (lefthook): ESLint on staged files + TypeScript type check + commitlint on commit message
- **Node version**: v20 (see `.nvmrc`)
- **Package manager**: Yarn 3.6.4

## Monorepo Structure

- `/` — library package (published to npm)
- `/example` — Expo example app for development and testing

## Testing

Tests live in `__tests___/` directories (note: triple underscore) alongside source files. Test framework is Jest with ts-jest. Tests focus on utility functions (date-utils, compute-positioning, generate-event-layouts).
