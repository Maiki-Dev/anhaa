'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'

interface AddMemberFormProps {
  onAddMember: (formData: FormData) => Promise<{ error?: string; success?: boolean }>
}

export function AddMemberForm({ onAddMember }: AddMemberFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    
    try {
      const result = await onAddMember(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        // Success
        const form = document.getElementById('add-member-form') as HTMLFormElement
        form?.reset()
        // Optional: show success message or just rely on optimistic update/revalidate
      }
    } catch {
      setError('Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form id="add-member-form" action={handleSubmit} className="flex gap-4 items-start">
      <div className="flex-1 space-y-1">
        <Label htmlFor="email" className="sr-only">Имэйл</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Хэрэглэгчийн имэйл"
          required
        />
        {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
      </div>
      <Button type="submit" variant="outline" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      </Button>
    </form>
  )
}
