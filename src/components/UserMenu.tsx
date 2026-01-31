'use client'

import * as React from 'react'
import Link from 'next/link'
import { User, Settings, LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

export function UserMenu({ isAdmin }: { isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative ml-3" ref={menuRef}>
      <div>
        <button
          type="button"
          className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:focus:ring-offset-gray-800"
          id="user-menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Open user menu</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 dark:ring-gray-600"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          tabIndex={-1}
        >
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
            role="menuitem"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Тохиргоо
          </Link>
          
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              role="menuitem"
              tabIndex={-1}
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-2 h-4 w-4" />
              Master Admin
            </Link>
          )}

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              role="menuitem"
              tabIndex={-1}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Гарах
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
