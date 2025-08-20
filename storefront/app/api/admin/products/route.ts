import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server-client'

const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  price_cents: z.number().int().nonnegative(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  const json = await req.json()
  const parsed = ProductSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const supabase = createClient()
  const { error } = await supabase.from('products').insert(parsed.data as any)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data })
}

