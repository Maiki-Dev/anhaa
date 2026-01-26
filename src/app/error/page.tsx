import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-gray-900">Уучлаарай, алдаа гарлаа</h2>
      <p className="mt-2 text-gray-600">Ямар нэг зүйл буруу боллоо. Дахин оролдоно уу.</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Нүүр хуудас руу буцах
      </Link>
    </div>
  )
}
