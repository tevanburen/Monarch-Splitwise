# Monarch-Splitwise

A Chrome extension that streamlines importing Splitwise transactions into Monarch Money.

## Overview

This extension adds a widget to the Monarch Money web interface, allowing you to upload Splitwise CSV exports and automatically import them as transactions into your configured Monarch accounts.

## Features

- **Easy CSV Upload**: Upload Splitwise CSV files directly from the Monarch interface
- **Account Mapping**: Configure which Splitwise accounts map to which Monarch accounts
- **Automatic Processing**: Matches and imports transactions while avoiding duplicates
- **Balance Tracking**: Updates account balances based on imported transactions
- **Flexible Configuration**: Set start dates, hide accounts, and customize widget position

## Installation

1. Clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the repository folder
5. The extension will now activate on Monarch Money pages

## Usage

1. Navigate to Monarch Money and click the widget in the bottom corner to open settings
2. Configure your account mappings (Splitwise account names, Monarch account IDs, etc.)
3. Export your transaction history from Splitwise as CSV
4. Upload the CSV files using the widget
5. Transactions are automatically imported into the corresponding Monarch accounts

## Future Improvements

- **Direct Splitwise Integration**: Connect directly to the Splitwise API to fetch transactions without manual CSV exports
- **API-Based Uploads**: Use Monarch Money's API to upload transactions directly instead of simulating UI interactions

## Disclaimer

This extension processes sensitive financial data entirely within your browser—no data is sent to external servers. However, handling financial information inherently carries risk. **Use this extension at your own risk.** While I use it myself for my own accounts, I am not responsible for any issues, data loss, or financial discrepancies that may arise from its use.
