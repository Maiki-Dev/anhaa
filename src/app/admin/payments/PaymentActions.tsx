'use client'

import { updatePaymentStatus } from './actions'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { useTransition } from 'react'

export function PaymentActions({ paymentId, status }: { paymentId: string, status: string }) {
  const [isPending, startTransition] = useTransition()

  if (status !== 'pending') return null

  return (
    <div className="flex gap-2">
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={() => startTransition(async () => { await updatePaymentStatus(paymentId, 'approved') })}
        disabled={isPending}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => startTransition(async () => { await updatePaymentStatus(paymentId, 'rejected') })}
        disabled={isPending}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
