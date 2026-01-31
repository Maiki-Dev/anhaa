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

  // Notify account creator
  const { data: account } = await supabase
    .from('savings_accounts')
    .select('created_by, name')
    .eq('id', accountId)
    .single()

  const { data: currentUser } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .single()

  if (account && currentUser && account.created_by !== user.id) {
    await supabase.from('notifications').insert({
      user_id: account.created_by,
      type: 'info',
      title: 'Шинэ гишүүн',
      message: `${currentUser.name || currentUser.email} таны "${account.name}" хадгаламжид нэгдлээ.`,
      data: { account_id: accountId }
    })
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

export async function markAsRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  revalidatePath('/dashboard')
}
