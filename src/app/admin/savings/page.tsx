import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SavingsActions } from './SavingsActions'

export default async function AdminSavingsPage() {
  const supabase = await createClient()

  // Fetch savings with member counts and total balance
  const { data: savings, error } = await supabase
    .from('savings_accounts')
    .select(`
      *,
      savings_members (count),
      savings_transactions (amount)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching savings:', error)
    return <div>Error loading savings</div>
  }

  // Calculate totals
  const totalSavings = savings.length
  const totalBalance = savings.reduce((acc, curr) => {
    const balance = curr.savings_transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
    return acc + balance
  }, 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Хадгаламжууд</h1>
          <p className="text-muted-foreground">
            Хадгаламжийн бүртгэл болон удирдлага
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Нийт хадгаламж
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSavings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Нийт үлдэгдэл
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('mn-MN', { style: 'decimal' }).format(totalBalance)}₮
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Хадгаламжийн жагсаалт</CardTitle>
          <CardDescription>
            Бүх хадгаламжийн дэлгэрэнгүй мэдээлэл
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Нэр</TableHead>
                <TableHead>Гишүүд</TableHead>
                <TableHead>Үлдэгдэл</TableHead>
                <TableHead>Үүсгэсэн огноо</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savings.map((account) => {
                const balance = account.savings_transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
                const memberCount = account.savings_members?.[0]?.count || 0

                return (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{memberCount}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('mn-MN', { style: 'decimal' }).format(balance)}₮
                    </TableCell>
                    <TableCell>
                      {new Date(account.created_at).toLocaleDateString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })}
                    </TableCell>
                    <TableCell>
                      <SavingsActions savings={{ id: account.id, name: account.name }} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
