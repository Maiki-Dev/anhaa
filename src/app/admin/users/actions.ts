'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  
  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }
  
  const { data: currentUserProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
    
  if (currentUserProfile?.role !== 'admin') {
    return { error: "Permission denied" }
  }

  // 1. Delete dependent data where user is the owner/creator (Cascade logic)
  
  // GROUPS created by user
  const { data: userGroups } = await supabase.from('groups').select('id').eq('created_by', userId)
  if (userGroups && userGroups.length > 0) {
      const groupIds = userGroups.map(g => g.id)
      
      // Delete group dependents
      await supabase.from('group_members').delete().in('group_id', groupIds)
      await supabase.from('payments').delete().in('group_id', groupIds)
      await supabase.from('progress').delete().in('group_id', groupIds)
      
      // Delete groups
      const { error: groupsError } = await supabase.from('groups').delete().in('id', groupIds)
      if (groupsError) console.error('Error deleting user groups:', groupsError)
  }

  // SAVINGS ACCOUNTS created by user
  const { data: userSavings } = await supabase.from('savings_accounts').select('id').eq('created_by', userId)
  if (userSavings && userSavings.length > 0) {
      const accountIds = userSavings.map(a => a.id)
      
      // Delete savings dependents
      await supabase.from('savings_transactions').delete().in('account_id', accountIds)
      await supabase.from('savings_messages').delete().in('account_id', accountIds)
      await supabase.from('savings_members').delete().in('account_id', accountIds)
      
      // Delete savings accounts
      const { error: savingsError } = await supabase.from('savings_accounts').delete().in('id', accountIds)
      if (savingsError) console.error('Error deleting user savings:', savingsError)
  }

  // 2. Delete dependent data where user is a participant
  await supabase.from('notifications').delete().eq('user_id', userId)
  await supabase.from('progress').delete().eq('user_id', userId)
  await supabase.from('payments').delete().eq('user_id', userId)
  await supabase.from('savings_transactions').delete().eq('user_id', userId)
  await supabase.from('savings_messages').delete().eq('user_id', userId)
  await supabase.from('savings_members').delete().eq('user_id', userId)
  await supabase.from('group_members').delete().eq('user_id', userId)

  // Delete from public.users
  const { error } = await supabase.from('users').delete().eq('id', userId)
  
  if (error) {
    return { error: error.message }
  }
  
  // Try to delete from Auth if we have the service role key
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
        const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
            autoRefreshToken: false,
            persistSession: false
            }
        }
        )
        
        await supabaseAdmin.auth.admin.deleteUser(userId)
    } catch (e) {
        console.error("Failed to delete user from Auth:", e)
    }
  }

  revalidatePath('/admin/users')
  revalidatePath('/admin/overview')
  return { success: true }
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient()
  
  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }
  
  const { data: currentUserProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
    
  if (currentUserProfile?.role !== 'admin') {
    return { error: "Permission denied" }
  }

  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
