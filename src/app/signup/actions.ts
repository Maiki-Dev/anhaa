'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const loan_type = formData.get('loan_type') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://anhaa-orcin.vercel.app/auth/callback',
      data: {
        name,
        loan_type,
      },
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (data?.user && !data?.session) {
    return redirect('/signup?message=Please check your email to confirm your account')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
