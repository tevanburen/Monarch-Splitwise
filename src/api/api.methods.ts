export const fetchMonarchCsv = async (authToken: string) => {
  const response = await fetch(
    'https://api.monarchmoney.com/download-transactions/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
      body: JSON.stringify({ accounts: ['208836640834093863'] }),
      referrerPolicy: 'no-referrer',
    }
  );
  return await response.text();
};
