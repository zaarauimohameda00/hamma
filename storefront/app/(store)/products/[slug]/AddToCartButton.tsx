"use client"
import { useFormStatus } from 'react-dom'

export function AddToCartButton() {
  // Fallback for React 18 - useFormStatus is not available; simple button state
  try {
    const { pending } = (useFormStatus as any)?.() || { pending: false }
    return (
      <button className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90 disabled:opacity-60" type="submit" disabled={pending}>
        {pending ? 'Adding…' : 'Add to cart'}
      </button>
    )
  } catch {
    return (
      <button className="rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90" type="submit">
        Add to cart
      </button>
    )
  }
}

