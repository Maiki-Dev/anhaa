'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createGroup(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const monthly_contribution = parseFloat(formData.get('monthly_contribution') as string)
  const max_members = parseInt(formData.get('max_members') as string)

  const { error } = await supabase.from('groups').insert({
    name,
    monthly_contribution,
    max_members,
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
