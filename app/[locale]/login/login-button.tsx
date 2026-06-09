'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Mail, CheckCircle } from 'lucide-react'

interface LoginButtonProps {
  locale: string
}

export function LoginButton({ locale }: LoginButtonProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-3 p-4 border rounded-lg bg-muted/30">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
        <p className="font-semibold">Link enviado!</p>
        <p className="text-sm text-muted-foreground">
          Verifique seu email <strong>{email}</strong> e clique no link para entrar.
        </p>
        <button
          className="text-xs text-muted-foreground hover:underline"
          onClick={() => { setSent(false); setEmail('') }}
        >
          Usar outro email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="pl-9"
          required
          autoFocus
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Enviando...' : 'Continuar com Email'}
      </Button>
    </form>
  )
}
