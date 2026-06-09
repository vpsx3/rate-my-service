'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TIBIA_SERVERS, VOCATIONS, SERVICE_TYPES } from '@/types'
import { useState } from 'react'

interface ExploreFiltersProps {
  currentParams: Record<string, string | undefined>
  locale: string
}

export function ExploreFilters({ currentParams, locale }: ExploreFiltersProps) {
  const t = useTranslations('explore')
  const router = useRouter()

  const [q, setQ] = useState(currentParams.q ?? '')
  const [server, setServer] = useState(currentParams.server ?? '')
  const [vocation, setVocation] = useState(currentParams.vocation ?? '')
  const [serviceType, setServiceType] = useState(currentParams.service_type ?? '')
  const [priceModel, setPriceModel] = useState(currentParams.price_model ?? '')
  const [available, setAvailable] = useState(currentParams.available === 'true')
  const [minRating, setMinRating] = useState(currentParams.min_rating ?? '')

  function applyFilters() {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (server) params.set('server', server)
    if (vocation) params.set('vocation', vocation)
    if (serviceType) params.set('service_type', serviceType)
    if (priceModel) params.set('price_model', priceModel)
    if (available) params.set('available', 'true')
    if (minRating) params.set('min_rating', minRating)
    router.push(`/${locale}/explore?${params.toString()}`)
  }

  function clearFilters() {
    setQ(''); setServer(''); setVocation(''); setServiceType('')
    setPriceModel(''); setAvailable(false); setMinRating('')
    router.push(`/${locale}/explore`)
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h2 className="font-semibold">{t('filters')}</h2>

      <div className="space-y-1">
        <Label className="text-xs">Search</Label>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name..." className="h-8 text-sm" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('filterServer')}</Label>
        <Select value={server} onValueChange={setServer}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={t('allServers')} />
          </SelectTrigger>
          <SelectContent className="max-h-52">
            <SelectItem value="">{t('allServers')}</SelectItem>
            {TIBIA_SERVERS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('filterVocation')}</Label>
        <Select value={vocation} onValueChange={setVocation}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={t('allVocations')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allVocations')}</SelectItem>
            {VOCATIONS.map((v) => (
              <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('filterService')}</Label>
        <Select value={serviceType} onValueChange={setServiceType}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={t('allServices')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allServices')}</SelectItem>
            {SERVICE_TYPES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('filterPriceModel')}</Label>
        <Select value={priceModel} onValueChange={setPriceModel}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={t('allPriceModels')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('allPriceModels')}</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="per_session">Per Session</SelectItem>
            <SelectItem value="per_level">Per Level</SelectItem>
            <SelectItem value="negotiable">Negotiable</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{t('filterMinRating')}</Label>
        <Select value={minRating} onValueChange={setMinRating}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={t('anyRating')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t('anyRating')}</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={available} onCheckedChange={setAvailable} id="available-filter" />
        <Label htmlFor="available-filter" className="text-xs cursor-pointer">{t('filterAvailable')}</Label>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={applyFilters}>Apply</Button>
        <Button size="sm" variant="outline" onClick={clearFilters}>Clear</Button>
      </div>
    </div>
  )
}
