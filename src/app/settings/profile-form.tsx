'use client'

import { updateProfile } from './actions'
import { useState } from 'react'

export function ProfileForm({ initialName }: { initialName: string }) {
  const [message, setMessage] = useState('')
  
  return (
    <form action={async (formData) => {
      const result = await updateProfile(formData)
      if (result?.error) {
        setMessage('Алдаа гарлаа: ' + result.error)
      } else if (result?.success) {
        setMessage('Амжилттай шинэчлэгдлээ!')
      }
    }} className="mt-5 space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Нэр
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            defaultValue={initialName}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Хадгалах
        </button>
      </div>

      {message && (
        <p className={`text-sm ${message.includes('Алдаа') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
