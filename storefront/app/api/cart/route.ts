import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ items: [] })
  const { data, error } = await supabase
    .from('cart_items')
    .select('id, quantity, product:products(id, name, price_cents, image_url)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const json = await req.json()
  const { product_id, quantity } = json
  // Ensure cart exists
  let { data: carts } = await supabase.from('carts').select('id').eq('user_id', user.id).limit(1)
  let cartId = carts?.[0]?.id
  if (!cartId) {
    const { data: newCart } = await supabase.from('carts').insert({ user_id: user.id }).select('id').single()
    cartId = newCart?.id
  }
  if (!cartId) return NextResponse.json({ error: 'Cart not available' }, { status: 500 })
  const { error } = await supabase.from('cart_items').insert({ cart_id: cartId, product_id, quantity })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

