import { cookies } from 'next/headers';

export async function callApi(path: string, init?: RequestInit) {
	const cookieStore = cookies();
	const token = cookieStore.get('sb-access-token')?.value;
	const guest = cookieStore.get('guest-token')?.value;
	const url = new URL(`/api${path}`, process.env.EXPRESS_BASE_URL);
	const res = await fetch(url.toString(), {
		...init,
		headers: {
			'content-type': 'application/json',
			...(token ? { authorization: `Bearer ${token}` } : {}),
			...(guest ? { 'x-guest-token': guest } : {}),
			...(init?.headers || {}),
		},
		cache: 'no-store',
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || `API error ${res.status}`);
	}
	return res.json();
}