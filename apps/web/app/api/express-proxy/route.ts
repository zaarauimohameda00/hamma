import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const target = new URL(`/api${url.searchParams.get('path') ?? ''}`, process.env.EXPRESS_BASE_URL);
  target.search = url.searchParams.get('qs') ?? '';
  const resp = await fetch(target.toString(), { headers: { 'content-type': 'application/json' }, cache: 'no-store' });
  const json = await resp.json();
  return new Response(JSON.stringify(json), { status: resp.status, headers: { 'content-type': 'application/json' } });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const target = new URL(`/api${url.searchParams.get('path') ?? ''}`, process.env.EXPRESS_BASE_URL);
  const token = req.cookies.get('sb-access-token')?.value;
  const body = await req.text();
  const resp = await fetch(target.toString(), {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body,
    cache: 'no-store',
  });
  const text = await resp.text();
  return new Response(text, { status: resp.status, headers: { 'content-type': 'application/json' } });
}