'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar } from '@/components/shared/avatar'
import { TIBIA_SERVERS, VOCATIONS, SERVICE_TYPES, ServiceType } from '@/types'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  profile: any
  servicerProfile: any
  userId: string
  locale?: string
}

export function SettingsForm({ profile, servicerProfile, userId }: SettingsFormProps) {
  const t = useTranslations('settings')
  const router = useRouter()
  const supabase = createClient()

  const [characterName, setCharacterName] = useState(profile.character_name)
  const [server, setServer] = useState(profile.server)
  const [vocation, setVocation] = useState(profile.vocation ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [isServicer, setIsServicer] = useState(profile.role?.includes('servicer') ?? false)

  // Servicer fields
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(servicerProfile?.service_types ?? [])
  const [priceModel, setPriceModel] = useState(servicerProfile?.price_model ?? '')
  const [priceMin, setPriceMin] = useState(servicerProfile?.price_min?.toString() ?? '')
  const [priceMax, setPriceMax] = useState(servicerProfile?.price_max?.toString() ?? '')
  const [currency, setCurrency] = useState(servicerProfile?.currency ?? 'gold')
  const [availability, setAvailability] = useState(servicerProfile?.availability ?? '')
  const [rules, setRules] = useState(servicerProfile?.rules ?? '')

  const [saving, setSaving] = useState(false)

  function toggleServiceType(type: ServiceType) {
    setServiceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!characterName.trim() || !server) {
      toast.error('Character name and server are required.')
      return
    }
    setSaving(true)

    let avatarUrl = profile.avatar_url

    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${userId}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })
      if (uploadError) {
        toast.error('Failed to upload avatar: ' + uploadError.message)
        setSaving(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      avatarUrl = publicUrl
    }

    const roles = isServicer
      ? profile.role?.includes('client') ? ['client', 'servicer'] : ['servicer']
      : ['client']

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        character_name: characterName.trim(),
        server,
        vocation: vocation || 'None',
        bio: bio || null,
        avatar_url: avatarUrl,
        role: roles,
      })
      .eq('id', userId)

    if (profileError) {
      toast.error(t('saveError') + ': ' + profileError.message)
      setSaving(false)
      return
    }

    if (isServicer) {
      const spData = {
        id: userId,
        service_types: serviceTypes,
        price_model: priceModel || null,
        price_min: priceMin ? parseFloat(priceMin) : null,
        price_max: priceMax ? parseFloat(priceMax) : null,
        currency,
        availability: availability || null,
        rules: rules || null,
        updated_at: new Date().toISOString(),
      }

      const { error: spError } = await supabase
        .from('servicer_profiles')
        .upsert(spData)

      if (spError) {
        toast.error(t('saveError') + ': ' + spError.message)
        setSaving(false)
        return
      }
    }

    toast.success(t('saveSuccess'))
    setSaving(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Profile section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profileSection')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar
              id={userId}
              name={characterName || 'U'}
              avatarUrl={avatarPreview}
              size="xl"
            />
            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                  {t('avatarUpload')}
                </Button>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('characterName')} *</Label>
            <Input value={characterName} onChange={(e) => setCharacterName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>{t('serverLabel')} *</Label>
            <Select value={server} onValueChange={setServer}>
              <SelectTrigger><SelectValue placeholder="Select server" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {TIBIA_SERVERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('vocationLabel')}</Label>
            <Select value={vocation} onValueChange={setVocation}>
              <SelectTrigger><SelectValue placeholder="Select vocation" /></SelectTrigger>
              <SelectContent>
                {VOCATIONS.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('bio')}</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('bioPlaceholder')} rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Servicer toggle */}
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
        <Switch checked={isServicer} onCheckedChange={setIsServicer} id="is-servicer" />
        <Label htmlFor="is-servicer" className="cursor-pointer font-medium">{t('isServicer')}</Label>
      </div>

      {/* Servicer section */}
      {isServicer && (
        <Card>
          <CardHeader>
            <CardTitle>{t('servicerSection')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('serviceTypes')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {SERVICE_TYPES.map((st) => (
                  <label key={st.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceTypes.includes(st.value)}
                      onChange={() => toggleServiceType(st.value)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{st.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('priceModel')}</Label>
              <Select value={priceModel} onValueChange={setPriceModel}>
                <SelectTrigger><SelectValue placeholder="Select price model" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="per_session">Per Session</SelectItem>
                  <SelectItem value="per_level">Per Level</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>{t('priceMin')}</Label>
                <Input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>{t('priceMax')}</Label>
                <Input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>{t('currency')}</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('availability')}</Label>
              <Input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder={t('availabilityPlaceholder')} />
            </div>

            <div className="space-y-2">
              <Label>{t('rules')}</Label>
              <Textarea value={rules} onChange={(e) => setRules(e.target.value)} placeholder={t('rulesPlaceholder')} rows={4} />
            </div>
          </CardContent>
        </Card>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={saving}>
        {saving ? 'Saving...' : t('save')}
      </Button>
    </form>
  )
}
