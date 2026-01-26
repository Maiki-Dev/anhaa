'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePaymentStatus(paymentId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()

  // Verify admin access (simplified for now, ideally check role)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Update payment status
  const { error } = await supabase
    .from('payments')
    .update({ status })
    .eq('id', paymentId)

  if (error) {
    console.error('Error updating payment:', error)
    return { error: 'Failed to update payment' }
  }

  // If approved, update progress
  if (status === 'approved') {
    // Fetch payment details to get user_id and group_id
    const { data: payment } = await supabase
      .from('payments')
      .select('user_id, group_id')
      .eq('id', paymentId)
      .single()

    if (payment) {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      
      // Update or insert progress
      const { data: progress } = await supabase
        .from('progress')
        .select('id')
        .eq('user_id', payment.user_id)
        .eq('group_id', payment.group_id)
        .eq('month', currentMonth)
        .single()

      if (progress) {
        await supabase
          .from('progress')
          .update({ paid: true })
          .eq('id', progress.id)
      } else {
        await supabase
          .from('progress')
          .insert({
            user_id: payment.user_id,
            group_id: payment.group_id,
            month: currentMonth,
            paid: true,
            note: 'Approved by admin'
          })
      }
    }
  }

  revalidatePath('/admin/payments')
  return { success: true }
}
