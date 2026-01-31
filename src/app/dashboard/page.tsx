import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { markAsPaid } from './actions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Users, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { NotificationsList } from './NotificationsList'

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parallel Data Fetching
  const currentMonth = new Date().toISOString().slice(0, 7)
  const startOfMonth = `${currentMonth}-01`
  const endOfMonth = `${currentMonth}-31`

  const [
    { data: profile },
    { data: myGroups },
    { data: progress },
    { data: payments },
    { data: notifications }
  ] = await Promise.all([
    // Fetch user profile
    supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single(),

    // Fetch user's groups
    supabase
      .from('group_members')
      .select('*, groups(*)')
      .eq('user_id', user.id),

    // Fetch this month's progress
    supabase
      .from('progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth),

    // Fetch this month's payments (to check for pending)
    supabase
      .from('payments')
      .select('group_id, status')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth),

    // Fetch notifications
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
  ])

  const hasPaidThisMonth = (groupId: string) => {
    return progress?.some((p: any) => p.group_id === groupId && p.paid)
  }

  const hasPendingPayment = (groupId: string) => {
    return payments?.some((p: any) => p.group_id === groupId && p.status === 'pending')
  }

  const getLoanTypeName = (type: string) => {
    switch(type) {
      case 'bank': return 'Банк'
      case 'nbfi': return 'ББСБ'
      case 'app': return 'Аппликейшн'
      default: return 'Тодорхойгүй'
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Сайн байна уу, <span className="text-primary">{profile?.name}</span>!
        </h1>
        <p className="text-muted-foreground">Өнөөдөр танд юу хийх хэрэгтэй вэ?</p>
      </div>

      <NotificationsList notifications={notifications || []} />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Миний Одууд</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile?.stars || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Идэвхтэй оролцооны үнэлгээ
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нэгдсэн бүлгүүд</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{myGroups?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Таны идэвхтэй бүлгүүд
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Зээлийн төрөл</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {getLoanTypeName(profile?.loan_type)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Бүртгэлтэй зээлийн ангилал
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Groups & Progress */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Миний бүлгүүд & Ахиц</h3>
        
        {myGroups && myGroups.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myGroups.map((member: any) => {
              const paid = hasPaidThisMonth(member.group_id)
              const pending = hasPendingPayment(member.group_id)
              
              return (
                <Card key={member.group_id} className="flex flex-col overflow-hidden border-t-4 border-t-primary shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{member.groups.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Сар бүр: <span className="font-semibold text-foreground">{member.groups.monthly_contribution.toLocaleString()}₮</span>
                        </CardDescription>
                      </div>
                      {paid ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Төлсөн
                        </Badge>
                      ) : pending ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Хүлээгдэж буй
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Төлөөгүй
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-6">
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Энэ сарын хураамжийн төлөв:
                      </div>
                      
                      {!paid && !pending ? (
                        <Button asChild className="w-full" size="lg">
                          <Link href={`/payment/${member.group_id}`}>
                            Төлбөр төлөх
                          </Link>
                        </Button>
                      ) : pending ? (
                        <div className="w-full bg-yellow-50/50 rounded-md p-3 text-center text-sm font-medium text-yellow-700 border border-yellow-100">
                           Төлбөр шалгагдаж байна
                        </div>
                      ) : (
                        <div className="w-full bg-secondary/50 rounded-md p-3 text-center text-sm font-medium text-muted-foreground border border-border">
                           Төлбөр амжилттай хийгдсэн
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">Одоогоор бүлэгт нэгдээгүй байна</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Та шинэ бүлэгт нэгдэж эсвэл өөрөө бүлэг үүсгэн хамт олны дэмжлэгийг аваарай.
              </p>
              <Button asChild className="mt-6" variant="outline">
                <Link href="/groups">Бүлгүүд харах</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
