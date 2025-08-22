"use server"
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server-client'

export async function addToCart(productId: string, quantity: number = 1) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  let { data: carts } = await supabase.from('carts').select('id').eq('user_id', user.id).limit(1)
  let cartId = carts?.[0]?.id
  if (!cartId) {
    const { data: newCart } = await supabase.from('carts').insert({ user_id: user.id }).select('id').single()
    cartId = newCart?.id
  }
  if (!cartId) throw new Error('Cart not available')
  const { error } = await supabase.from('cart_items').insert({ cart_id: cartId, product_id: productId, quantity })
  if (error) throw error
  revalidatePath('/cart')
}

