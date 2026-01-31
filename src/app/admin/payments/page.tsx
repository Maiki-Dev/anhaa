import { createClient } from '@/utils/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentActions } from "./PaymentActions"
import { CreditCard } from "lucide-react"

interface PaymentWithRelations {
  id: string
  created_at: string
  amount: number
  status: string
  note: string | null
  users: {
    name: string | null
    email: string | null
  } | null
  groups: {
    name: string
  } | null
}

export default async function AdminPaymentsPage() {
  const supabase = await createClient()

  // Fetch payments from payments table
  const { data: rawPayments, error } = await supabase
    .from('payments')
    .select(`
      *,
      users (
        name,
        email
      ),
      groups (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    return <div>Error loading payments</div>
  }

  const payments = rawPayments as unknown as PaymentWithRelations[]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Баталгаажсан</Badge>
      case 'rejected':
        return <Badge variant="destructive">Татгалзсан</Badge>
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Хүлээгдэж буй</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Төлбөрүүд</h2>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Сүүлийн гүйлгээнүүд</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Огноо</TableHead>
                <TableHead>Хэрэглэгч</TableHead>
                <TableHead>Бүлэг</TableHead>
                <TableHead>Дүн</TableHead>
                <TableHead>Төлөв</TableHead>
                <TableHead>Үйлдэл</TableHead>
                <TableHead>Тэмдэглэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{payment.users?.name || 'Нэргүй'}</span>
                        <span className="text-xs text-muted-foreground">{payment.users?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{payment.groups?.name}</TableCell>
                    <TableCell className="font-medium">{payment.amount?.toLocaleString('mn-MN')}₮</TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <PaymentActions 
                        paymentId={payment.id} 
                        status={payment.status} 
                        amount={payment.amount}
                        note={payment.note}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                      {payment.note}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Төлбөрийн мэдээлэл олдсонгүй
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
