'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send } from 'lucide-react'
import { sendMessage } from './chat-actions'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  users: {
    name: string
    email: string
  }
}

export function ChatSection({ 
  accountId, 
  initialMessages, 
  currentUserId 
}: { 
  accountId: string
  initialMessages: Message[]
  currentUserId: string
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom on initial load and when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])
  
  // Update messages when initialMessages prop changes (e.g. from revalidation)
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    setSending(true)
    const content = input
    setInput('') // Optimistic clear

    // Optimistic update (optional, but good for UX)
    // const optimisticMsg = {
    //   id: 'temp-' + Date.now(),
    //   content: content,
    //   created_at: new Date().toISOString(),
    //   user_id: currentUserId,
    //   users: { name: 'Me', email: '' }
    // }
    // setMessages(prev => [...prev, optimisticMsg])

    try {
      const result = await sendMessage(accountId, content)
      if (result?.error) {
        toast.error('Зурвас илгээхэд алдаа гарлаа')
      }
    } catch {
      toast.error('Сүлжээний алдаа')
    } finally {
      setSending(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="border-b px-4 py-3">
        <CardTitle className="text-lg">Чат</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              Зурвас бичээрэй...
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === currentUserId
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="text-xs">
                      {getInitials(msg.users?.name || '?')}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-semibold mb-1 opacity-70">
                        {msg.users?.name}
                      </p>
                    )}
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Зурвас бичих..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
