"use client"
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  price_cents: z.coerce.number().int().nonnegative(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
})

type ProductForm = z.infer<typeof ProductSchema>

export default function NewProductPage() {
  const form = useForm<ProductForm>({
    resolver: zodResolver(ProductSchema),
    defaultValues: { name: '', slug: '', price_cents: 0, description: '', image_url: '' },
  })

  async function onSubmit(values: ProductForm) {
    await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    form.reset()
  }

  return (
    <main className="container py-10">
      <h1 className="mb-6 text-3xl font-semibold">Create product</h1>
      <form className="grid max-w-xl gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <label className="grid gap-1">
          <span className="text-sm text-muted-foreground">Name</span>
          <input className="rounded-md border p-2" {...form.register('name')} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted-foreground">Slug</span>
          <input className="rounded-md border p-2" {...form.register('slug')} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted-foreground">Price (cents)</span>
          <input className="rounded-md border p-2" type="number" {...form.register('price_cents', { valueAsNumber: true })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted-foreground">Image URL</span>
          <input className="rounded-md border p-2" {...form.register('image_url')} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-muted-foreground">Description</span>
          <textarea className="rounded-md border p-2" rows={5} {...form.register('description')} />
        </label>
        <div>
          <button className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90" type="submit">Save</button>
        </div>
      </form>
    </main>
  )
}

