# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server (builds to dist/librarie.js and serves on localhost:3456)
npm run serve

# Build
npm run dev          # Development webpack build
npm run build        # Production webpack build (development mode)
npm run bundle       # Production webpack build (production/minified)
npm run production   # Full production build: bundle + copy dist files

# Tests
npm run test         # Jest tests with coverage (all __tests__/**/*.{ts,tsx} files)
npm run utiltest     # Mocha tests for LibraryUtilities (__tests__/mochatest/)

# Run a single Jest test file
npx jest __tests__/UITests.tsx
npx jest __tests__/LibraryContainerTests.tsx

# License generation
npm run generate_license
```

Test results are written to `TestResults/TestReport.xml` (Jest) and `TestResults/MochaReport.xml` (Mocha).

## Architecture

**librarie.js** is a React component library that renders a searchable, hierarchical type/function browser (used in Dynamo Visual Programming). It is built as a UMD bundle (`LibraryEntryPoint`) for both browser and Node.js embedding.

### Data Flow

1. Host app calls `CreateLibraryController()` → gets a `LibraryController` instance (`src/entry-point.tsx`)
2. Host calls `setLoadedTypesJson()` and `setLayoutSpecsJson()` to provide data
3. Host calls `createLibraryByElementId(elementId)` or `createLibraryContainer()` to mount the React tree
4. `LibraryContainer` is the root React component that owns all UI state

### Key Files

- **`src/entry-point.tsx`** — Public API: `LibraryController` class with event system, request handlers, and methods to mount/refresh the library
- **`src/components/LibraryContainer.tsx`** — Root React component; owns search state, category filtering, tooltip, and hosting context
- **`src/LibraryUtilities.ts`** — Core data types (`TypeListNode`, `ItemData`, `LayoutElement`) and `JsonDownloader`; also contains layout/search processing logic
- **`src/Searcher.tsx`** — `Searcher` class for search and category filtering
- **`src/EventHandler.ts`** — `Event` and `Reactor` classes powering the pub/sub event system
- **`src/SharedTypes.ts`** — `HostingContextType` enum (`home`, `custom`, `none`)

### Component Tree

```
LibraryContainer
├── SearchBar           (search input + category checkboxes)
├── LibraryItem         (recursive: sections → categories → groups → items)
│   └── ClusterView     (clustered item display)
├── SearchResultItem    (rendered in search mode)
└── ItemSummary         (parameter detail panel, shown on hover/click)
```

### Event System

`LibraryController` exposes events via `on(eventName, callback)`:
- `itemClicked`, `itemMouseEnter`, `itemMouseLeave`, `itemSummaryExpanded`
- `sectionIconClicked`, `searchTextUpdated`, `filterCategoryChange`

Custom search can be injected via `registerRequestHandler("searchLibraryItemsHandler", fn)`.

### Testing Setup

- **Jest** with `ts-jest` for `.ts`/`.tsx` files; React Testing Library (`@testing-library/react`) for component rendering
- **Mocha** (`npm run utiltest`) for `LibraryUtilities` unit tests only
- Mocks: `__mocks__/fileMock.ts` (static assets), `__mocks__/styleMock.ts` (CSS)
- Snapshots live in `__tests__/Snapshottest/`

### Tech Debt Context

All tech-debt phases (1–7) are complete: React 16→18→19 upgrade, `UNSAFE_` removal, class → functional components, Enzyme → React Testing Library, TypeScript strict mode, bundle optimization, ESLint/ErrorBoundary/JSDoc additions, and React 19 adoption. See `TECH_DEBT_ANALYSIS.md` and `MIGRATION_GUIDE.md` for details.
