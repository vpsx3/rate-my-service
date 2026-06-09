import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/shared/header'
import { DashboardClient } from './dashboard-client'
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage({
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

  const { data: receivedReviews } = await supabase
    .from('reviews')
    .select('*, from_profile:profiles!from_user_id(*)')
    .eq('to_user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: givenReviews } = await supabase
    .from('reviews')
    .select('*, to_profile:profiles!to_user_id(*)')
    .eq('from_user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: receivedVouches } = await supabase
    .from('vouches')
    .select('*, from_profile:profiles!from_user_id(*)')
    .eq('to_user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: givenVouches } = await supabase
    .from('vouches')
    .select('*, to_profile:profiles!to_user_id(*)')
    .eq('from_user_id', user.id)
    .order('created_at', { ascending: false })

  const t = await getTranslations('dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <a href={`/${locale}/settings`} className="text-sm text-primary hover:underline">
            {t('editProfile')}
          </a>
        </div>
        <DashboardClient
          profile={profile}
          servicerProfile={servicerProfile}
          receivedReviews={receivedReviews ?? []}
          givenReviews={givenReviews ?? []}
          receivedVouches={receivedVouches ?? []}
          givenVouches={givenVouches ?? []}
          locale={locale}
        />
      </main>
    </div>
  )
}
