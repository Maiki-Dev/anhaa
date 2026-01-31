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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Бүлгүүдийн удирдлага</h2>
        <p className="text-muted-foreground">Бүх бүлгүүдийг хянах, устгах</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Бүлгүүд ({groups?.length || 0})</CardTitle>
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
                  <TableCell>{group.monthly_contribution.toLocaleString()}₮</TableCell>
                  <TableCell>{group.max_members}</TableCell>
                  <TableCell>{new Date(group.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <GroupActions groupId={group.id} groupName={group.name} />
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
