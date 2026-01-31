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
