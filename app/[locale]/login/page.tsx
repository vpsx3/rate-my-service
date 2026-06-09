import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginButton } from './login-button'
import { Swords } from 'lucide-react'

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    redirect(profile ? `/${locale}/dashboard` : `/${locale}/onboarding`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Swords className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Rate My Service</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to rate servicers, leave vouches, and manage your profile.
          </p>
        </div>
        <LoginButton locale={locale} />
        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to our Terms of Service.
        </p>
      </div>
    </div>
  )
}
