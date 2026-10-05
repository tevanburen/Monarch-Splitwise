# Privacy Policy for Splitwise Sync for Monarch

Last updated: October 4, 2026

Splitwise Sync for Monarch ("the extension") is a Chrome extension that copies a user's Splitwise group expenses into their Monarch accounts. This policy explains what data the extension handles and what it does with it.

## Summary

All processing happens locally in your browser. The extension has no server and sends no data to the developer or any third party. It only communicates with Monarch (app.monarch.com) and Splitwise (secure.splitwise.com), using the sessions you're already logged into.

## Data the extension handles

- **Splitwise expenses**: for each Splitwise group you link, the extension exports the group's expenses to calculate your share of each one.
- **Monarch transactions**: for each Monarch account you link, the extension exports the account's existing transactions so it can skip ones that are already there.
- **Your Splitwise display name**: read from Splitwise's own page data so the extension can find your share of each expense. It's held in memory only and discarded when the tab closes.
- **Monarch CSRF token**: read from Monarch's cookies and sent back to Monarch with the extension's export requests, as Monarch requires. Your session cookies are attached by the browser and are never read by the extension.
- **Your sync configuration**: the Monarch account IDs, Splitwise group IDs, labels, start dates, and widget position you enter in the settings.

## How the data is used

The data is used only to sync expenses: comparing Splitwise expenses with Monarch transactions and importing the missing ones into Monarch through Monarch's own import feature. It isn't used for anything else.

## Storage

Your sync configuration is saved in Chrome's sync storage (`chrome.storage.sync`), so it's available in any Chrome browser where you're signed in to the same Google account. Transaction data and your Splitwise display name are never stored. They exist only in memory while a sync runs.

## Sharing

The extension doesn't sell, share, or transfer your data to anyone. Data goes only to Monarch and Splitwise, the services you're syncing between. The extension contains no analytics, tracking, or advertising.

## Your control

You can delete your sync configuration at any time by removing the account links in the extension's settings or uninstalling the extension. Transactions imported into Monarch can be managed in Monarch like any other transaction.

## Affiliation

This extension is an independent project and is not affiliated with, endorsed by, or sponsored by Monarch Money or Splitwise.

## Contact

Questions about this policy can be raised as an issue at https://github.com/tevanburen/Monarch-Splitwise/issues.
