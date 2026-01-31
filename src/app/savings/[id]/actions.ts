'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addDeposit(accountId: string, amount: number) {
  if (!amount || amount <= 0) return { error: 'Мөнгөн дүн буруу байна' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Нэвтрэх шаардлагатай' }

  // Verify membership
  const { data: member } = await supabase
    .from('savings_members')
    .select('id')
    .eq('account_id', accountId)
    .eq('user_id', user.id)
    .single()

  if (!member) return { error: 'Та энэ хадгаламжийн гишүүн биш байна' }

  const { error } = await supabase.from('savings_transactions').insert({
    account_id: accountId,
    user_id: user.id,
    amount: amount,
    payment_method: 'qpay', // Simulating QPay/Od system
    note: 'Od system deposit'
  })

  if (error) {
    console.error('Error adding deposit:', error)
    return { error: 'Хадгаламж нэмэхэд алдаа гарлаа' }
  }

  // Update stars logic if needed (e.g. 1 star per 10,000 MNT?)
  // For now, we just record the deposit.

  revalidatePath(`/savings/${accountId}`)
  return { success: true }
}
