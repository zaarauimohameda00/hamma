import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

function getServiceClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key)
}

const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  price_cents: z.number().int().nonnegative(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
})

app.get('/health', (_req, res) => res.json({ ok: true }))

app.get('/products', async (_req, res) => {
  let supabase
  try {
    supabase = getServiceClient()
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ products: data })
})

app.post('/products', async (req, res) => {
  const parsed = ProductSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  let supabase
  try {
    supabase = getServiceClient()
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
  const { error } = await supabase.from('products').insert(parsed.data as any)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Admin server listening on http://localhost:${port}`)
})

