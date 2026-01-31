'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(accountId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const { error } = await supabase.from('savings_messages').insert({
    account_id: accountId,
    user_id: user.id,
    content: content
  })

  if (error) {
    console.error('Error sending message:', error)
    return { error: 'Failed to send message' }
  }

  revalidatePath(`/savings/${accountId}`)
}
