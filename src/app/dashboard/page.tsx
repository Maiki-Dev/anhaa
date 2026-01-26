import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { markAsPaid } from './actions'

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's groups
  const { data: myGroups } = await supabase
    .from('group_members')
    .select('*, groups(*)')
    .eq('user_id', user.id)

  // Fetch this month's progress
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', currentMonth)

  const hasPaidThisMonth = (groupId: string) => {
    return progress?.some((p: any) => p.group_id === groupId && p.paid)
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Сайн байна уу, {profile?.name}!
          </h2>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Миний Одууд</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{profile?.stars || 0} ⭐</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Нэгдсэн бүлгүүд</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{myGroups?.length || 0}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">Зээлийн төрөл</dt>
          <dd className="mt-1 text-xl font-semibold tracking-tight text-gray-900 capitalize">
            {profile?.loan_type === 'bank' ? 'Банк' : 
             profile?.loan_type === 'nbfi' ? 'ББСБ' : 
             profile?.loan_type === 'app' ? 'Аппликейшн' : 'Тодорхойгүй'}
          </dd>
        </div>
      </div>

      {/* Active Groups & Progress */}
      <h3 className="text-lg font-medium leading-6 text-gray-900">Миний бүлгүүд & Ахиц</h3>
      
      {myGroups && myGroups.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {myGroups.map((member: any) => (
            <div key={member.group_id} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">{member.groups.name}</h3>
                <p className="mt-1 text-sm text-gray-500">Сар бүр: {member.groups.monthly_contribution}₮</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-500 mb-4">
                  Энэ сарын төлөв: {hasPaidThisMonth(member.group_id) ? 
                    <span className="text-green-600 font-bold">Төлсөн ✅</span> : 
                    <span className="text-red-600 font-bold">Төлөөгүй ❌</span>
                  }
                </p>
                
                {!hasPaidThisMonth(member.group_id) && (
                  <Link
                    href={`/payment/${member.group_id}`}
                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 sm:text-sm"
                  >
                    Төлбөр төлөх
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Та одоогоор ямар ч бүлэгт нэгдээгүй байна.</p>
          <a href="/groups" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
            Бүлгүүдийг үзэх &rarr;
          </a>
        </div>
      )}
    </div>
  )
}
