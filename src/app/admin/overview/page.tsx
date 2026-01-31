import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Layers, Activity, DollarSign, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function OverviewPage() {
  const supabase = await createClient()

  // Fetch stats
  const { count: usersCount } = await supabase.from("users").select("*", { count: "exact", head: true })
  const { count: groupsCount } = await supabase.from("groups").select("*", { count: "exact", head: true })
  
  // Calculate total payments
  const { data: payments } = await supabase.from("payments").select("amount")
  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  // Fetch recent transactions
  const { data: recentPayments } = await supabase
    .from("payments")
    .select("*, users(name, email)")
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Хяналтын самбар</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нийт орлого</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('mn-MN')}₮</div>
            <p className="text-xs text-muted-foreground">
              Системийн нийт орлого
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Хэрэглэгчид</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
            <p className="text-xs text-muted-foreground">
              Бүртгэлтэй нийт хэрэглэгч
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Бүлгүүд</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupsCount}</div>
            <p className="text-xs text-muted-foreground">
              Идэвхтэй бүлгүүд
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сүүлийн гүйлгээ</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentPayments && recentPayments.length > 0 
                ? `${recentPayments[0].amount.toLocaleString('mn-MN')}₮` 
                : '0₮'}
            </div>
            <p className="text-xs text-muted-foreground">
              Хамгийн сүүлд хийгдсэн
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Сүүлийн гүйлгээнүүд</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentPayments?.map((payment) => (
                <div key={payment.id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {payment.users?.name || payment.users?.email || 'Unknown User'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.users?.email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">+{payment.amount.toLocaleString('mn-MN')}₮</div>
                </div>
              ))}
              {(!recentPayments || recentPayments.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  Гүйлгээ олдсонгүй
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Шуурхай удирдлага</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  Хэрэглэгчид удирдах
                </Link>
             </Button>
             <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/groups">
                  <Layers className="mr-2 h-4 w-4" />
                  Бүлгүүд удирдах
                </Link>
             </Button>
             <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/payments">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Төлбөрүүд хянах
                </Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
