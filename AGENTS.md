# AGENTS.md

Chrome extension (Manifest V3) that syncs Splitwise group expenses into Monarch accounts. See `README.md` for the user-facing overview and architecture diagram.

## Commands

- `pnpm build`: Vite build into `dist/` (what `manifest.json` points at)
- `pnpm dev`: build in watch mode
- `pnpm fix`: Biome format + lint with autofix

CI (`.github/workflows/ci.yml`) runs `biome ci .` and `pnpm build` on PRs. There are no tests.

Use pnpm only. After a rebuild, the extension has to be reloaded from `chrome://extensions` before changes take effect.

## Layout

Each Vite entry point in `vite.config.ts` maps to one script the manifest loads:

- `src/scripts/background/`: service worker. `driver.ts` runs the sync (fetch both sides, trim to start date, diff, upload). `rows.ts` has the diff/trim helpers. `state-manager.ts` owns global state and persists account config to `chrome.storage.sync`.
- `src/scripts/content/`: content script on Monarch and Splitwise tabs. `data-api.ts` fetches and parses CSVs, `data-service.ts` orchestrates per-account fetch/upload, `interaction.ts` drives the Monarch UI for CSV upload.
- `src/scripts/page/fetch-interceptor.ts`: MAIN-world script that captures the Splitwise user name from `get_main_data`.
- `src/scripts/ui/`: React widget rendered in an iframe (shadcn components under `components/shadcn/`).
- `src/types/`: shared types, including the message contracts between background and content scripts (`messages.ts`).

The `@/` alias resolves to `src/`.

## Gotchas

- `TvbRow` is the normalized row format both sides convert to. Rows are matched on exact date, `delta`, and `description`.
- Row order from the APIs isn't consistent: Monarch returns newest first, Splitwise oldest first. `spliceElementsBS` assumes ascending dates, so sort before calling it.
- Dates get serialized across `chrome.runtime` messages, so the background re-wraps them with `new Date(...)` after each fetch.
- Monarch uploads go through UI automation (navigating to the account page and feeding a CSV to the import input), so Monarch DOM changes can break them.
- Background logs (including the unmatched-rows warning) show up in the service worker console, not the page console.

## Style

React + TypeScript + Tailwind, formatted by Biome (tabs, double quotes). Arrow functions only, named React imports (no `React.X`).
