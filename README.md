# Monarch-Splitwise

A Chrome extension that automatically syncs Splitwise transactions into Monarch.

## Overview

This extension adds a widget to both the Monarch and Splitwise web interfaces, enabling automatic synchronization of transactions between Splitwise groups and your Monarch accounts. It connects directly to both platforms' APIs to fetch transaction data, compare for duplicates, and import new transactions.

## Features

- **Direct API Integration**: Connects to both Splitwise and Monarch APIs for seamless data synchronization
- **One-Click Sync**: Click "Sync" to automatically fetch Splitwise transactions and import them to Monarch
- **Account Mapping**: Configure which Splitwise groups map to which Monarch accounts
- **Duplicate Detection**: Intelligently matches transactions to avoid importing duplicates
- **Balance Updates**: Automatically updates Monarch account balances after import
- **Flexible Configuration**: Set start dates per account, hide inactive accounts, and position the widget left or right
- **Multi-Account Support**: Sync multiple Splitwise groups to different Monarch accounts simultaneously

## Installation

1. Clone this repository to your local machine
2. Run `pnpm install` to install dependencies
3. Run `pnpm build` to build the extension
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right corner
6. Click "Load unpacked" and select the repository folder
7. The extension widget will now appear on Monarch and Splitwise pages

## Usage

1. Navigate to **Monarch** or **Splitwise** and you'll see the widget in the bottom corner
2. Click the settings button to configure your account mappings:
   - **Account Name**: A friendly label for this link
   - **Monarch ID**: Your Monarch account UUID (found in the account URL: `/accounts/details/[UUID]`)
   - **Splitwise ID**: Your Splitwise group ID (found in the group URL: `/groups/[ID]`)
   - **Start Date**: Only sync transactions from this date forward (optional)
3. Click **Save** to store your configuration
4. Click **Sync** to fetch Splitwise transactions and import them to Monarch
5. The widget shows sync status per account with success/error indicators

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Background Service Worker                    │
│  - Maintains global state across all tabs                           │
│  - Coordinates sync operations (driver.ts)                          │
│  - Persists account configuration to chrome.storage.sync            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  Monarch Tab      │ │  Splitwise Tab    │ │  Widget (iframe)  │
│  Content Script   │ │  Content Script   │ │  React UI         │
│  - Fetches API    │ │  - Fetches API    │ │  - Settings modal │
│  - Uploads rows   │ │  - Gets user name │ │  - Sync button    │
│  - UI automation  │ │                   │ │  - Status display │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

### Auth

- **Monarch**: Uses cookie-based authentication. The session cookie (`session_id`) is sent automatically by the browser via `credentials: include`, and the CSRF token (`csrftoken`) is read from `document.cookie` and passed as an `X-CSRFToken` header on POST requests.
- **Splitwise**: Uses cookie-based authentication via `credentials: include`. The Splitwise user name (needed to identify your column in the CSV export) is captured by intercepting the XHR response from `/api/v3.0/get_main_data` in the page context (MAIN world script).

### Sync Process

1. **Fetch Phase**: Parallel requests to Splitwise (CSV export API) and Monarch (download API)
2. **Transform Phase**: Convert both datasets to normalized internal format
3. **Diff Phase**: Compare transactions by date, amount, and description to find new entries
4. **Upload Phase**: Navigate Monarch UI to import new transactions via CSV upload

## Development

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Development watch mode
pnpm dev

# Lint & format
pnpm fix
```

## Future Improvements

- **Direct Monarch API Uploads**: Use Monarch's mutation API to create transactions directly instead of UI automation
- **Real-time Sync**: Automatic background sync at configurable intervals
- **Better Error Recovery**: Retry failed syncs and provide detailed error messages

## Technical Notes

- Built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui
- Uses Chrome Extension Manifest V3
- State is synced across tabs via the background service worker
- Both Monarch and Splitwise auth use browser cookies (`credentials: include`); Monarch also requires an `X-CSRFToken` header read from `document.cookie`; Splitwise username is captured via XHR interception in the page context
- Long-running operations use keep-alive messaging to prevent service worker timeout
- Much of the code comments and documentation were written with assistance from GitHub Copilot (typically using Claude Sonnet 4.5)

## Disclaimer

This extension reads and modifies financial data in your Monarch and Splitwise accounts. All processing happens locally in your browser—your data is never transmitted to me or any third party, and I have no way to access it.

That said, any tool that manipulates financial data carries inherent risk. **Use this extension at your own risk.** I use it for my own accounts and it works well for me, but I cannot be held responsible for any data loss, sync errors, or financial discrepancies that may occur.
