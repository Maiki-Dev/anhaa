'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileMenu({ isAdmin }: { isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="fixed left-0 right-0 top-16 bg-background border-b shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 z-50">
          <Link
            href="/dashboard"
            className="text-lg font-medium transition-colors hover:text-primary py-2 border-b border-border/50"
            onClick={() => setIsOpen(false)}
          >
            Хяналтын самбар
          </Link>
          <Link
            href="/groups"
            className="text-lg font-medium transition-colors hover:text-primary py-2 border-b border-border/50"
            onClick={() => setIsOpen(false)}
          >
            Бүлэг хамтрал
          </Link>
          <Link
            href="/savings"
            className="text-lg font-medium transition-colors hover:text-primary py-2"
            onClick={() => setIsOpen(false)}
          >
            Хадгаламж
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-lg font-medium transition-colors hover:text-primary py-2 border-t border-border/50"
              onClick={() => setIsOpen(false)}
            >
              Master Admin
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
