'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string

  // Update public.users table
  const { error: profileError } = await supabase
    .from('users')
    .update({ name })
    .eq('id', user.id)

  if (profileError) {
    console.error('Error updating profile:', profileError)
    return { error: 'Failed to update profile' }
  }

  // Update auth.users metadata (optional but good for consistency)
  const { error: authError } = await supabase.auth.updateUser({
    data: { name }
  })

  if (authError) {
    console.error('Error updating auth metadata:', authError)
    // We don't fail here if profile update succeeded
  }

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  
  return { success: 'Profile updated successfully' }
}
