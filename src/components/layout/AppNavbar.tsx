'use client'

import { usePathname } from 'next/navigation'

export function AppNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Hide Navbar on admin pages
  const isHidden = pathname?.startsWith('/admin')

  if (isHidden) {
    return null
  }

  return <>{children}</>
}
