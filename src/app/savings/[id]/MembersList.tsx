'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Member {
  id: string
  status: string
  users: {
    name: string
    email: string
  }
}

export function MembersList({ members }: { members: Member[] }) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Идэвхтэй</Badge>
      case 'invited':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Уригдсан</Badge>
      case 'rejected':
        return <Badge variant="destructive">Татгалзсан</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Гишүүд ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>{getInitials(member.users?.name || '?')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{member.users?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{member.users?.email}</p>
                </div>
              </div>
              {getStatusBadge(member.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
