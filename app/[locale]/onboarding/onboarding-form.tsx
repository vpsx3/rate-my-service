'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TIBIA_SERVERS, VOCATIONS } from '@/types'
import { toast } from 'sonner'

interface OnboardingFormProps {
  userId: string
  locale: string
}

export function OnboardingForm({ userId, locale }: OnboardingFormProps) {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const supabase = createClient()

  const [characterName, setCharacterName] = useState('')
  const [server, setServer] = useState('')
  const [vocation, setVocation] = useState('')
  const [role, setRole] = useState<'client' | 'servicer' | 'both'>('client')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!characterName.trim() || !server) {
      toast.error('Character name and server are required.')
      return
    }

    setLoading(true)

    const roles =
      role === 'both' ? ['client', 'servicer'] : [role]

    const { error } = await supabase.from('profiles').insert({
      id: userId,
      character_name: characterName.trim(),
      server,
      vocation: vocation || 'None',
      role: roles,
    })

    if (error) {
      toast.error('Failed to create profile: ' + error.message)
      setLoading(false)
      return
    }

    if (role === 'servicer' || role === 'both') {
      await supabase.from('servicer_profiles').insert({ id: userId })
    }

    router.push(`/${locale}/dashboard`)
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="characterName">{t('characterName')} *</Label>
            <Input
              id="characterName"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Tibia Knight"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t('serverLabel')} *</Label>
            <Select value={server} onValueChange={setServer} required>
              <SelectTrigger>
                <SelectValue placeholder="Select server" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {TIBIA_SERVERS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('vocationLabel')}</Label>
            <Select value={vocation} onValueChange={setVocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select vocation" />
              </SelectTrigger>
              <SelectContent>
                {VOCATIONS.map((v) => (
                  <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('roleLabel')}</Label>
            <div className="space-y-2">
              {[
                { value: 'client', label: t('roleClient') },
                { value: 'servicer', label: t('roleServicer') },
                { value: 'both', label: t('roleBoth') },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={role === opt.value}
                    onChange={() => setRole(opt.value as 'client' | 'servicer' | 'both')}
                    className="h-4 w-4 text-primary"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : t('continueButton')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
