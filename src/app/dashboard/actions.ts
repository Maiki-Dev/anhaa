'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function markAsPaid(groupId: string, note: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const month = new Date().toISOString().slice(0, 7) // YYYY-MM

  const { error } = await supabase
    .from('progress')
    .insert({
      user_id: user.id,
      group_id: groupId,
      month: month,
      paid: true,
      note: note
    })

  if (error) {
    console.error('Error marking as paid:', error)
    return { error: 'Failed to update progress' }
  }

  revalidatePath('/dashboard')
}
