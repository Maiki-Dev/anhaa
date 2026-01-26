'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function submitPayment(groupId: string, method: 'qpay' | 'bank_transfer', note: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Fetch group details to get the amount
  const { data: group } = await supabase
    .from('groups')
    .select('monthly_contribution')
    .eq('id', groupId)
    .single()

  if (!group) {
    return { error: 'Group not found' }
  }

  // Determine status based on method
  // QPay: In a real app, we would verify with API. Here we simulate 'verified' for demo if QPay, or keep 'pending' for check.
  // For this request, user wants status logic.
  // Usually:
  // Bank Transfer -> 'pending' (User claims they sent money, Admin must verify)
  // QPay -> 'verified' (If API returns success) or 'pending' (if API check is manual/delayed)
  
  // Let's assume for QPay 'simulation' we mark it as verified immediately to show the difference,
  // OR keep it pending if we want to be realistic without API.
  // User asked: "qpay bol qpay eer dansaar bol dansaar gdgiig n automataar shalgadag bolmoor bn"
  // "check automatically if it is qpay or account".
  
  // Let's set status:
  // Bank Transfer -> 'pending'
  // QPay -> 'verified' (Simulating successful API callback for now)
  
  const status = method === 'qpay' ? 'verified' : 'pending'

  // Insert into payments table
  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      group_id: groupId,
      amount: group.monthly_contribution,
      status: status,
      payment_method: method,
      note: note
    })

  if (error) {
    console.error('Error recording payment:', error)
    return { error: 'Payment recording failed' }
  }

  // If verified, we should also update the 'progress' table to show 'paid = true'
  if (status === 'verified') {
     // Check if progress exists for this month, if so update, else insert
     const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
     
     // First try to update
     const { data: progress, error: fetchError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
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
                user_id: user.id,
                group_id: groupId,
                month: currentMonth,
                paid: true,
                note: 'Paid via QPay'
            })
     }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/payment/${groupId}`)
  
  redirect('/dashboard')
}
