let sessionId;

export async function login() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: process.env.NEXT_PUBLIC_USER_LOGIN,
                password: process.env.NEXT_PUBLIC_USER_PASS
            })
        }
    );
    const { loginResponse } = await res.json();
    sessionId = loginResponse?.[0]?.SessionID;
}

export async function fetchBillingProducts() {
    if (!sessionId) await login();
    const sql = `SELECT Name, Id FROM Product WHERE Name IN (
    'Cloud Data Standard Trial',
    'Cloud Data Premium Trial'
  )`;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/query?sql=${encodeURIComponent(sql)}`;
    const res = await fetch(url, { headers: { sessionId } });

    if (!res.ok) throw new Error(res.statusText);
    const { queryResponse } = await res.json();
    console.log(queryResponse);
    return queryResponse;
}