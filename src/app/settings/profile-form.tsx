'use client'

import { updateProfile } from './actions'
import { useState } from 'react'
import Image from 'next/image'

interface ProfileFormProps {
  initialName: string
  initialAccountNumber: string
  initialPhoneNumber: string
  initialAvatarUrl: string
}

// Profile update form component
export function SettingsProfileForm({ 
  initialName, 
  initialAccountNumber, 
  initialPhoneNumber, 
  initialAvatarUrl 
}: ProfileFormProps) {
  const [message, setMessage] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialAvatarUrl)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  return (
    <form action={async (formData) => {
      setMessage('Шинэчилж байна...')
      const result = await updateProfile(formData)
      if (result?.error) {
        setMessage('Алдаа гарлаа: ' + result.error)
      } else if (result?.success) {
        setMessage('Амжилттай шинэчлэгдлээ!')
      }
    }} className="mt-5 space-y-6">
      
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 dark:border-gray-700">
          {avatarPreview ? (
            <Image 
              src={avatarPreview} 
              alt="Avatar" 
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          )}
        </div>
        <div className="w-full max-w-xs">
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">
            Зураг оруулах
          </label>
          <input
            type="file"
            name="avatar"
            id="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-gray-700 dark:file:text-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Утасны дугаар
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="phone_number"
              id="phone_number"
              defaultValue={initialPhoneNumber}
              placeholder="99112233"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Дансны дугаар
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="account_number"
              id="account_number"
              defaultValue={initialAccountNumber}
              placeholder="5000000000"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Хадгаламж болон бүлгийн гүйлгээ хийхэд ашиглагдана.
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Хадгалах
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('Алдаа') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          <p className="text-sm font-medium text-center">{message}</p>
        </div>
      )}
    </form>
  )
}
