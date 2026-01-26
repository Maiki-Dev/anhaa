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

export async function acceptInvite(notificationId: string, accountId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Update member status
  const { error: updateError } = await supabase
    .from('savings_members')
    .update({ status: 'active' })
    .eq('account_id', accountId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Error accepting invite:', updateError)
    return { error: 'Failed to accept invite' }
  }

  // Mark notification as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  revalidatePath('/dashboard')
  revalidatePath(`/savings/${accountId}`)
  return { success: true }
}

export async function rejectInvite(notificationId: string, accountId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Update member status (or delete row?) - let's set to rejected
  await supabase
    .from('savings_members')
    .update({ status: 'rejected' })
    .eq('account_id', accountId)
    .eq('user_id', user.id)

  // Mark notification as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  revalidatePath('/dashboard')
}
