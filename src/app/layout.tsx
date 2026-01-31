import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { AppNavbar } from '@/components/layout/AppNavbar'
import Navbar from '@/components/Navbar'
import { NavbarSkeleton } from '@/components/NavbarSkeleton'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nexa Finance',
  description: 'Community platform for debt support',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppNavbar>
            <Suspense fallback={<NavbarSkeleton />}>
              <Navbar />
            </Suspense>
          </AppNavbar>
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
