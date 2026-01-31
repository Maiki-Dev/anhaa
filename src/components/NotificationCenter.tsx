'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { acceptInvite, rejectInvite } from '@/app/dashboard/actions'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export function NotificationCenter({ notifications }: { notifications: Notification[] }) {
  const [loading, setLoading] = useState<string | null>(null)
  const unreadCount = notifications.filter((n) => !n.is_read).length

  async function handleAccept(n: Notification, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
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

  async function handleReject(n: Notification, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
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

  async function handleMarkAsRead(n: Notification) {
    if (n.is_read) return
    // Here you would implement the mark as read logic
    // For now we just console log
    console.log('Marking as read:', n.id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-background" />
          )}
          <span className="sr-only">Мэдэгдэл</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Мэдэгдлүүд</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {unreadCount} шинэ
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Мэдэгдэл байхгүй байна
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((n) => (
              <DropdownMenuItem 
                key={n.id} 
                className="flex flex-col items-start gap-1 p-3 cursor-default focus:bg-accent/50"
                onSelect={(e) => {
                  if (n.type !== 'savings_invite') {
                    handleMarkAsRead(n)
                  } else {
                    e.preventDefault()
                  }
                }}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium leading-none ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {new Date(n.created_at).toLocaleDateString('mn-MN')}
                    </p>
                  </div>
                  {!n.is_read && <div className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                </div>
                
                {n.type === 'savings_invite' && !n.is_read && (
                  <div className="flex gap-2 mt-2 w-full">
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 text-xs w-full bg-green-600 hover:bg-green-700"
                      onClick={(e) => handleAccept(n, e)}
                      disabled={loading === n.id}
                    >
                      {loading === n.id ? '...' : 'Зөвшөөрөх'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs w-full border-red-200 text-red-600 hover:bg-red-50"
                      onClick={(e) => handleReject(n, e)}
                      disabled={loading === n.id}
                    >
                      Татгалзах
                    </Button>
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
