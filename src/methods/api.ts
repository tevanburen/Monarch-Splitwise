/**
 * Fetches transaction CSV data from Monarch Money API.
 *
 * @param monarchId - The Monarch account ID to fetch transactions for
 * @param authToken - Authentication token for the Monarch API
 * @returns Promise resolving to CSV text content
 */
export const fetchMonarchCsv = async (
	monarchId: string,
	authToken: string,
): Promise<string> => {
	const response = await fetch(
		"https://api.monarch.com/download-transactions/",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: authToken,
			},
			body: JSON.stringify({ accounts: [monarchId] }),
			referrerPolicy: "no-referrer",
		},
	);
	return await response.text();
};

export const fetchSplitwiseCsv = async (accountId: string): Promise<string> => {
	// Splitwise uses cookie-based authentication, not the Monarch auth token
	const response = await fetch(
		`https://secure.splitwise.com/api/v3.0/export_group/${accountId}.csv`,
		{
			method: "GET",
			credentials: "include", // Include cookies for Splitwise authentication
		},
	);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch data for account ${accountId}: ${response.status} ${response.statusText}`,
		);
	}

	return await response.text();
};
