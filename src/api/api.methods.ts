/**
 * Fetches transaction CSV data from Monarch Money API.
 *
 * @param monarchId - The Monarch account ID to fetch transactions for
 * @param authToken - Authentication token for the Monarch API
 * @returns Promise resolving to CSV text content
 */
export const fetchMonarchCsv = async (monarchId: string, authToken: string) => {
	const response = await fetch(
		"https://api.monarchmoney.com/download-transactions/",
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
