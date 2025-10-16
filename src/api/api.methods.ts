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
