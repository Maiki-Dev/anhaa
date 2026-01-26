'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" /> // Placeholder to avoid hydration mismatch
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md ${theme === 'light' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
        aria-label="Light mode"
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md ${theme === 'dark' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
        aria-label="Dark mode"
      >
        <Moon className="h-5 w-5" />
      </button>
      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
        {theme === 'light' ? 'Гэрэлтэй' : 'Харанхуй'}
      </span>
    </div>
  )
}
