'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Уншиж байна...
        </>
      ) : (
        'Нэвтрэх'
      )}
    </Button>
  )
}
