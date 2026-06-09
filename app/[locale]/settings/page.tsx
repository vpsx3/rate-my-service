import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/shared/header'
import { SettingsForm } from './settings-form'
import { getTranslations } from 'next-intl/server'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect(`/${locale}/onboarding`)

  const { data: servicerProfile } = await supabase
    .from('servicer_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const t = await getTranslations('settings')

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        <SettingsForm
          profile={profile}
          servicerProfile={servicerProfile}
          userId={user.id}
          locale={locale}
        />
      </main>
    </div>
  )
}
