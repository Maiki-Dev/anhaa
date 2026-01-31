import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { ThemeToggleIcon } from '@/components/ThemeToggleIcon'
import { UserMenu } from '@/components/UserMenu'
import { MobileMenu } from '@/components/MobileMenu'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/NotificationCenter'

export default async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  let notifications: any[] = []

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'

    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (notifs) notifications = notifs
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {user && <MobileMenu isAdmin={isAdmin} />}
            <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Nexa Finance
              </span>
            </Link>
          </div>
          
          {user && (
            <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
              <Link
                href="/dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Хяналтын самбар
              </Link>
              <Link
                href="/groups"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Бүлэг хамтрал
              </Link>
              <Link
                href="/savings"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Хадгаламж
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-4">
            <ThemeToggleIcon />
            {user && <NotificationCenter notifications={notifications} />}
            {user ? (
              <UserMenu isAdmin={isAdmin} />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/signup">Бүртгүүлэх</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Нэвтрэх</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
