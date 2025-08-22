import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server-client'

export async function POST() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('create_order_from_cart')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ order_id: data })
}

