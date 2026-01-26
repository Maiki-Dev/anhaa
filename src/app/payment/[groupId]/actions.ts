'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function verifyPayment(groupId: string, note: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Here we would typically verify with QPay/Bank API
  // For now, we simulate a successful payment verification
  
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM

  const { error } = await supabase
    .from('progress')
    .insert({
      user_id: user.id,
      group_id: groupId,
      month: month,
      paid: false,
      note: note + ' (Pending Verification)'
    })

  if (error) {
    console.error('Error recording payment:', error)
    return { error: 'Payment recording failed' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard?payment=pending')
}
