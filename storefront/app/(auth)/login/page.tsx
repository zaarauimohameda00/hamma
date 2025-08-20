"use client"
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    if (res.ok) setMessage('Check your email for a magic link')
    else setMessage('Failed to send link')
  }
  return (
    <main className="container py-10">
      <h1 className="mb-6 text-3xl font-semibold">Sign in</h1>
      <form className="flex max-w-sm gap-2" onSubmit={submit}>
        <input className="flex-1 rounded-md border p-2" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="rounded-md bg-foreground px-4 py-2 text-background" type="submit">Send link</button>
      </form>
      {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
    </main>
  )
}

