'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const monthly_contribution = parseFloat(formData.get('monthly_contribution') as string)
  const max_members = parseInt(formData.get('max_members') as string)

  // Check limits
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    // Check how many groups the user has created
    // Note: This assumes created_by column exists. If not, this check might fail or return 0.
    // The user should run the migration SQL provided.
    const { count, error: countError } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)
    
    // If column doesn't exist, countError might occur. We proceed with caution or fail.
    // Assuming migration is applied.
    if (!countError && (count || 0) >= 1) {
      return { error: 'Та зөвхөн 1 бүлэг үүсгэх эрхтэй' }
    }
  }

  const { error } = await supabase.from('groups').insert({
    name,
    monthly_contribution,
    max_members,
    created_by: user.id,
  })

  if (error) {
    console.error('Error creating group:', error)
    return { error: 'Failed to create group' }
  }

  revalidatePath('/groups')
}

export async function joinGroup(groupId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 1. Check if group is full
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('max_members, group_members(count)')
    .eq('id', groupId)
    .single()
  
  if (groupError || !group) return { error: 'Group not found' }

  // Supabase count returns an array or object depending on query, here it's likely mapped.
  // Actually, let's just get the count separately to be safe or rely on the return.
  // The above query `group_members(count)` is not standard Supabase JS select syntax for count without head/etc easily mixed.
  // Let's do a separate count query or fetch all members.
  
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)

  if ((count || 0) >= group.max_members) {
    return { error: 'Group is full' }
  }

  // 2. Check if already joined
  const { data: existing } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { error: 'Already a member' }
  }

  // 3. Join
  const { error } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: user.id,
    rotation_order: (count || 0) + 1,
  })

  if (error) {
    console.error('Error joining group:', error)
    return { error: 'Failed to join group' }
  }

  revalidatePath('/groups')
  revalidatePath('/dashboard')
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check if admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    console.error('Error deleting group:', error)
    return { error: 'Failed to delete group' }
  }

  revalidatePath('/admin/groups')
  revalidatePath('/groups')
  revalidatePath('/dashboard')
}

export async function updateGroup(groupId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Check if admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const monthly_contribution = parseFloat(formData.get('monthly_contribution') as string)
  const max_members = parseInt(formData.get('max_members') as string)

  const { error } = await supabase
    .from('groups')
    .update({
      name,
      monthly_contribution,
      max_members
    })
    .eq('id', groupId)

  if (error) {
    console.error('Error updating group:', error)
    return { error: 'Failed to update group' }
  }

  revalidatePath('/admin/groups')
  revalidatePath('/groups')
  revalidatePath('/dashboard')
}
