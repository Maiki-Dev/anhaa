import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsProfileForm } from './profile-form'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('name, account_number, phone_number, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Тохиргоо</h1>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Хувийн мэдээлэл
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Таны хувийн мэдээлэл болон тохиргоо.
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
          <SettingsProfileForm 
            initialName={profile?.name || ''} 
            initialAccountNumber={profile?.account_number || ''}
            initialPhoneNumber={profile?.phone_number || ''}
            initialAvatarUrl={profile?.avatar_url || ''}
          />
        </div>
      </div>
    </div>
  )
}
