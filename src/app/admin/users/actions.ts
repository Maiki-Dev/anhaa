'use server'

import { createClient, createAdminClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

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

  // Initialize admin client for bypassing RLS if key is available
  let db = supabase
  let supabaseAdmin = null
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
     supabaseAdmin = await createAdminClient()
     db = supabaseAdmin
   } else {
     console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. RLS bypass will not work.')
   }

  // 1. Delete dependent data where user is the owner/creator (Cascade logic)
  
  // GROUPS created by user
  const { data: userGroups } = await db.from('groups').select('id').eq('created_by', userId)
  if (userGroups && userGroups.length > 0) {
      const groupIds = userGroups.map(g => g.id)
      
      // Delete group dependents
      await db.from('group_members').delete().in('group_id', groupIds)
      await db.from('payments').delete().in('group_id', groupIds)
      await db.from('progress').delete().in('group_id', groupIds)
      
      // Delete groups
      const { error: groupsError } = await db.from('groups').delete().in('id', groupIds)
      if (groupsError) {
        console.error('Error deleting user groups:', groupsError)
        return { error: `Failed to delete user groups: ${groupsError.message}` }
      }
  }

  // SAVINGS ACCOUNTS created by user
  const { data: userSavings } = await db.from('savings_accounts').select('id').eq('created_by', userId)
  if (userSavings && userSavings.length > 0) {
      const accountIds = userSavings.map(a => a.id)
      
      // Delete savings dependents
      await db.from('savings_transactions').delete().in('account_id', accountIds)
      await db.from('savings_messages').delete().in('account_id', accountIds)
      await db.from('savings_members').delete().in('account_id', accountIds)
      
      // Delete savings accounts
      const { error: savingsError } = await db.from('savings_accounts').delete().in('id', accountIds)
      if (savingsError) {
        console.error('Error deleting user savings:', savingsError)
        return { error: `Failed to delete user savings: ${savingsError.message}` }
      }
  }

  // 2. Delete dependent data where user is a participant
  await db.from('notifications').delete().eq('user_id', userId)
  await db.from('progress').delete().eq('user_id', userId)
  await db.from('payments').delete().eq('user_id', userId)
  await db.from('savings_transactions').delete().eq('user_id', userId)
  await db.from('savings_messages').delete().eq('user_id', userId)
  await db.from('savings_members').delete().eq('user_id', userId)
  await db.from('group_members').delete().eq('user_id', userId)

  // Delete from public.users
  const { error, count } = await db.from('users').delete({ count: 'exact' }).eq('id', userId)
  
  if (error) {
    return { error: error.message }
  }

  if (count === 0) {
    console.error('Failed to delete user: 0 rows deleted. Check RLS or ID.')
    return { error: 'Хэрэглэгч устсангүй. (0 rows deleted)' }
  }
  
  // Try to delete from Auth if we have the service role key
  if (supabaseAdmin) {
    try {
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

export async function updateUser(userId: string, data: { name?: string, loan_type?: string, account_number?: string, phone_number?: string, email?: string }) {
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

  // Initialize admin client for bypassing RLS if key is available
  let db = supabase
  let supabaseAdmin = null
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
     supabaseAdmin = await createAdminClient()
     db = supabaseAdmin
   }

  const { error } = await db
    .from('users')
    .update({
        ...(data.name && { name: data.name }),
        ...(data.loan_type && { loan_type: data.loan_type }),
        ...(data.account_number && { account_number: data.account_number }),
        ...(data.phone_number && { phone_number: data.phone_number }),
        // Email update in public table (usually handled via trigger from auth, but admin might force sync)
        ...(data.email && { email: data.email }) 
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }
  
  // If email or phone is changed, we should try to update it in Auth as well if we have admin rights
  if ((data.email || data.phone_number) && supabaseAdmin) {
      const authUpdate: any = {}
      if (data.email) authUpdate.email = data.email
      if (data.phone_number) authUpdate.phone = data.phone_number
      // Also update user metadata
      if (data.name || data.account_number || data.phone_number || data.loan_type) {
        authUpdate.user_metadata = {
            ...(data.name && { name: data.name }),
            ...(data.loan_type && { loan_type: data.loan_type }),
            ...(data.account_number && { account_number: data.account_number }),
            ...(data.phone_number && { phone_number: data.phone_number }),
        }
      }

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        authUpdate
      )
      if (authError) {
          console.error("Failed to update Auth data:", authError)
          // We don't fail the whole request, but warn. 
          return { error: `Profile updated but Auth update failed: ${authError.message}` }
      }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
