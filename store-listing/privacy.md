# Privacy practices tab

Answers for the Chrome Web Store Developer Dashboard privacy tab.

## Single purpose description

Syncs a user's Splitwise group expenses into their Monarch accounts. When the user clicks Sync, the extension reads their share of each expense from the linked Splitwise group, compares it against the transactions already in the linked Monarch account, and imports only the missing ones through Monarch's own CSV import.

## Permission justification

### storage

Stores the user's sync configuration: which Splitwise group is linked to which Monarch account, an optional label and start date for each link, whether a link is inactive, and which side of the page the widget sits on. It uses chrome.storage.sync so the configuration follows the user across their Chrome browsers. No transaction data is stored.

### Host permission

The content scripts run only on app.monarch.com and secure.splitwise.com, the two services the extension syncs between. On Splitwise, they export the linked group's expenses and read the user's Splitwise display name from the page's own data, which is needed to find the user's share of each expense. On Monarch, they export the linked account's existing transactions to check for duplicates, then import new transactions through Monarch's import page. They also show the sync widget on both sites. All requests go to these two sites using the user's existing logged-in session, and nothing is sent anywhere else.

## Privacy policy URL

https://github.com/tevanburen/Monarch-Splitwise/blob/main/store-listing/privacy-policy.md
