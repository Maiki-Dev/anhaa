'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteSavings(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Нэвтрэх шаардлагатай' }

  // Check if admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Зөвхөн админ устгах боломжтой' }
  }

  // Initialize admin client for bypassing RLS if key is available
  let db = supabase
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    db = await createAdminClient()
  }

  // Delete dependencies first
  await db.from('savings_transactions').delete().eq('account_id', id)
  await db.from('savings_members').delete().eq('account_id', id)
  await db.from('savings_messages').delete().eq('account_id', id)

  const { error } = await db.from('savings_accounts').delete().eq('id', id)

  if (error) {
    console.error('Error deleting savings account:', error)
    return { error: 'Хадгаламж устгахад алдаа гарлаа' }
  }

  revalidatePath('/admin/savings')
  return { success: true }
}

export async function updateSavings(id: string, name: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Нэвтрэх шаардлагатай' }

  // Check if admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Зөвхөн админ засах боломжтой' }
  }

  const { error } = await supabase
    .from('savings_accounts')
    .update({ name })
    .eq('id', id)

  if (error) {
    console.error('Error updating savings account:', error)
    return { error: 'Хадгаламж шинэчлэхэд алдаа гарлаа' }
  }

  revalidatePath('/admin/savings')
  return { success: true }
}
