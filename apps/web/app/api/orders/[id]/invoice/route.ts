import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get('sb-access-token')?.value;
  const target = new URL(`/api/orders/${params.id}/invoice`, process.env.EXPRESS_BASE_URL);
  const resp = await fetch(target.toString(), {
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}) },
    cache: 'no-store',
  });
  return new Response(resp.body, {
    status: resp.status,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename=invoice-${params.id}.pdf`,
    },
  });
}