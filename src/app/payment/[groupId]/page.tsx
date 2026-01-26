import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyPayment } from './actions'

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch group details
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Бүлэг олдсонгүй</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
            Буцах
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Төлбөр төлөх
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {group.name} бүлгийн сарын хураамж
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Төлөх дүн:</span>
                <span className="text-lg font-bold text-blue-700">{group.monthly_contribution}₮</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Данс:</span>
                <span className="text-sm font-medium text-gray-900">ХААН Банк 5000000000</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-500">Хүлээн авагч:</span>
                <span className="text-sm font-medium text-gray-900">Nexa Finance</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-500">Гүйлгээний утга:</span>
                <span className="text-sm font-medium text-gray-900">{user.email}</span>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">QPay-ээр төлөх</p>
                {/* Placeholder for QPay QR Code */}
                <div className="bg-gray-200 w-48 h-48 mx-auto flex items-center justify-center rounded-lg">
                  <span className="text-gray-500 text-xs">QR Code Placeholder</span>
                </div>
              </div>
            </div>

            <form action={async () => {
              'use server'
              await verifyPayment(groupId, 'QPay Payment')
            }}>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Төлбөр шалгах
              </button>
            </form>

            <div className="text-center mt-4">
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
                Буцах
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
