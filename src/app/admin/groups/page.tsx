import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GroupActions } from './GroupActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers } from 'lucide-react'

export default async function AdminGroupsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Бүлгүүдийн удирдлага</h2>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Бүх бүлгүүд ({groups?.length || 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Нэр</TableHead>
                <TableHead>Сар бүрийн хураамж</TableHead>
                <TableHead>Гишүүд</TableHead>
                <TableHead>Үүсгэсэн огноо</TableHead>
                <TableHead className="text-right">Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups?.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.monthly_contribution.toLocaleString('mn-MN')}₮</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                      {group.max_members}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(group.created_at).toLocaleDateString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })}</TableCell>
                  <TableCell className="text-right">
                    <GroupActions 
                      groupId={group.id} 
                      groupName={group.name} 
                      contribution={group.monthly_contribution}
                      maxMembers={group.max_members}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {(!groups || groups.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Бүлэг олдсонгүй
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
