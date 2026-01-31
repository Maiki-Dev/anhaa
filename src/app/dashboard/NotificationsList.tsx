'use client'

import { useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { acceptInvite, rejectInvite } from './actions'
import { toast } from 'sonner' // Assuming sonner is installed or use standard alert
// If sonner is not installed, I'll use simple alert or console

interface Notification {
  id: string
  title: string
  message: string
  type: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export function NotificationsList({ notifications }: { notifications: Notification[] }) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!notifications || notifications.length === 0) return null

  const unreadNotifications = notifications.filter(n => !n.is_read)

  if (unreadNotifications.length === 0) return null

  async function handleAccept(n: Notification) {
    setLoading(n.id)
    try {
      if (n.type === 'savings_invite') {
        const result = await acceptInvite(n.id, n.data.account_id as string)
        if (result?.error) {
          toast.error('Алдаа гарлаа: ' + result.error)
        } else {
          toast.success('Амжилттай нэгдлээ')
        }
      }
    } catch (e) {
      console.error(e)
      toast.error('Сүлжээний алдаа гарлаа')
    } finally {
      setLoading(null)
    }
  }

  async function handleReject(n: Notification) {
    setLoading(n.id)
    try {
      if (n.type === 'savings_invite') {
        await rejectInvite(n.id, n.data.account_id as string)
        toast.success('Татгалзлаа')
      }
    } catch (e) {
      console.error(e)
      toast.error('Алдаа гарлаа')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          Мэдэгдлүүд
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unreadNotifications.map((n) => (
          <div key={n.id} className="flex items-start justify-between bg-white p-3 rounded-lg border shadow-sm">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{n.title}</p>
              <p className="text-sm text-muted-foreground break-words">{n.message}</p>
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              {n.type === 'savings_invite' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleReject(n)}
                    disabled={loading === n.id}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Татгалзах</span>
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                    onClick={() => handleAccept(n)}
                    disabled={loading === n.id}
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Зөвшөөрөх</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
