'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const account_number = formData.get('account_number') as string
  const phone_number = formData.get('phone_number') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatar_url = null

  // Handle Avatar Upload
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`
    
    // Upload image
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      // Continue without updating avatar if upload fails, or return error?
      // Better to warn but continue updating other fields? Or fail?
      // Let's log it.
    } else {
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      avatar_url = publicUrl
      
      // Add a cache buster query param to ensure UI updates immediately
      avatar_url = `${avatar_url}?t=${new Date().getTime()}`
    }
  }

  // Update public.users table
  const updateData: any = { 
    name,
    account_number,
    phone_number
  }
  
  if (avatar_url) {
    updateData.avatar_url = avatar_url
  }

  const { error: profileError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id)

  if (profileError) {
    console.error('Error updating profile:', profileError)
    return { error: 'Failed to update profile' }
  }

  // Update auth.users metadata
  const authUpdateData: any = { name, account_number, phone_number }
  if (avatar_url) authUpdateData.avatar_url = avatar_url

  const { error: authError } = await supabase.auth.updateUser({
    data: authUpdateData
  })

  if (authError) {
    console.error('Error updating auth metadata:', authError)
  }

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  
  return { success: 'Profile updated successfully' }
}
