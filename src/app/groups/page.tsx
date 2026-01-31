import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createGroup, joinGroup } from './actions'

export default async function GroupsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all groups
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch my memberships to check status
  const { data: myMemberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const myGroupIds = new Set(myMemberships?.map((m) => m.group_id))

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Бүлгүүд
          </h2>
        </div>
      </div>

      {/* Create Group Form */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Шинэ бүлэг үүсгэх</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Өөрийн хэрэгцээнд тохирсон дэмжлэгийн бүлгийг үүсгээрэй.</p>
          </div>
          <form action={async (formData) => {
            'use server'
            await createGroup(formData)
          }} className="mt-5 sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs mr-2 mb-2 sm:mb-0">
              <label htmlFor="name" className="sr-only">Бүлгийн нэр</label>
              <input
                type="text"
                name="name"
                id="name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="Бүлгийн нэр"
                required
              />
            </div>
            <div className="w-full sm:max-w-xs mr-2 mb-2 sm:mb-0">
              <label htmlFor="monthly_contribution" className="sr-only">Сар бүрийн хураамж</label>
              <input
                type="number"
                name="monthly_contribution"
                id="monthly_contribution"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="Хураамж (₮)"
                required
              />
            </div>
            <div className="w-full sm:max-w-xs mr-2 mb-2 sm:mb-0">
              <label htmlFor="max_members" className="sr-only">Гишүүдийн тоо</label>
              <input
                type="number"
                name="max_members"
                id="max_members"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="Гишүүдийн тоо"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:mt-0 sm:w-auto"
            >
              Үүсгэх
            </button>
          </form>
        </div>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => (
          <div key={group.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col justify-between">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
              <dl className="mt-2 divide-y divide-gray-200">
                <div className="flex justify-between py-2 text-sm">
                  <dt className="text-gray-500">Сар бүр:</dt>
                  <dd className="font-medium text-gray-900">{group.monthly_contribution}₮</dd>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <dt className="text-gray-500">Гишүүд:</dt>
                  <dd className="font-medium text-gray-900">{group.max_members}</dd>
                </div>
              </dl>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              {myGroupIds.has(group.id) ? (
                <span className="inline-flex w-full justify-center items-center rounded-md bg-green-100 px-3 py-2 text-sm font-semibold text-green-800">
                  Нэгдсэн
                </span>
              ) : (
                <form action={async () => {
                  'use server'
                  await joinGroup(group.id)
                }}>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 sm:text-sm"
                  >
                    Нэгдэх
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
