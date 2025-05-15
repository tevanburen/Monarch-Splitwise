export const fetchMonarchRows = async (authToken: string) => {
  console.log(authToken);
  // In Chrome, try injecting code directly into the page like this:
  // console.log(window);
  // const tmp = fetch('https://api.monarchmoney.com/download-transactions/', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: AUTH_TOKEN,
  //   },
  //   body: JSON.stringify({accounts: ["208836640834093863"]}),
  //   referrerPolicy: 'no-referrer',
  // })
  // console.log(await tmp);
};
