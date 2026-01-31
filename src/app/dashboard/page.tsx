import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
    return progress?.some((p: { group_id: string; paid: boolean }) => p.group_id === groupId && p.paid)
  }

  const hasPendingPayment = (groupId: string) => {
    return payments?.some((p: { group_id: string; status: string }) => p.group_id === groupId && p.status === 'pending')
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
    <div className="container max-w-5xl mx-auto py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 md:p-12 border border-primary/10 shadow-lg shadow-primary/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl opacity-50" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Идэвхтэй
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Сайн байна уу, <span className="text-primary">{profile?.name}</span>!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Өнөөдөр танд санхүүгийн зорилгодоо хүрэхэд нэг алхам ойртох боломж байна.
          </p>
        </div>
      </div>

      <NotificationsList notifications={notifications || []} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Миний Одууд</CardTitle>
            <div className="p-2.5 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-foreground group-hover:scale-105 transition-transform duration-300 origin-left">{profile?.stars || 0}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Идэвхтэй оролцооны үнэлгээ
            </p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Нэгдсэн бүлгүүд</CardTitle>
            <div className="p-2.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
               <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-bold text-foreground group-hover:scale-105 transition-transform duration-300 origin-left">{myGroups?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Таны идэвхтэй бүлгүүд
            </p>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
           <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Зээлийн төрөл</CardTitle>
            <div className="p-2.5 bg-green-100/50 dark:bg-green-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold capitalize text-foreground group-hover:scale-105 transition-transform duration-300 origin-left">
              {getLoanTypeName(profile?.loan_type)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Бүртгэлтэй зээлийн ангилал
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Groups & Progress */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
           <div className="space-y-1">
             <h3 className="text-2xl font-bold tracking-tight">Миний бүлгүүд</h3>
             <p className="text-sm text-muted-foreground">Таны оролцож буй бүлгүүдийн явц</p>
           </div>
           <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors rounded-full px-6">
             <Link href="/groups">Бүгдийг харах</Link>
           </Button>
        </div>
        
        {myGroups && myGroups.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myGroups.map((member: { group_id: string; groups: { name: string; monthly_contribution: number } }) => {
              const paid = hasPaidThisMonth(member.group_id)
              const pending = hasPendingPayment(member.group_id)
              
              return (
                <Card key={member.group_id} className="flex flex-col overflow-hidden border-none shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-card/50 backdrop-blur-sm">
                  <div className={`h-2 w-full ${paid ? 'bg-green-500' : pending ? 'bg-yellow-500' : 'bg-destructive'}`} />
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{member.groups.name}</CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-2 font-medium">
                           <span className="text-foreground text-lg">{member.groups.monthly_contribution.toLocaleString()}₮</span>
                           <span className="text-muted-foreground text-sm font-normal">/ сар</span>
                        </CardDescription>
                      </div>
                      {paid ? (
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                      ) : pending ? (
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pt-2 pb-6">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground font-medium">Төлөв:</span>
                        <Badge variant={paid ? 'default' : pending ? 'secondary' : 'destructive'} className={`${paid ? 'bg-green-500 hover:bg-green-600' : pending ? 'bg-yellow-500 hover:bg-yellow-600' : ''} transition-colors`}>
                           {paid ? 'Төлөгдсөн' : pending ? 'Шалгагдаж байна' : 'Төлөгдөөгүй'}
                        </Badge>
                      </div>
                      
                      {!paid && !pending ? (
                        <Button asChild className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl" size="lg">
                          <Link href={`/payment/${member.group_id}`}>
                            Төлбөр төлөх
                          </Link>
                        </Button>
                      ) : pending ? (
                        <Button variant="outline" className="w-full h-11 cursor-default bg-yellow-50/50 hover:bg-yellow-50/50 border-yellow-200 text-yellow-700" disabled>
                           <Clock className="w-4 h-4 mr-2" /> Төлбөр шалгагдаж байна
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full h-11 cursor-default bg-green-50/50 hover:bg-green-50/50 border-green-200 text-green-700" disabled>
                           <CheckCircle2 className="w-4 h-4 mr-2" /> Төлбөр амжилттай
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-muted/30 border-dashed border-2 hover:border-primary/50 transition-colors">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-background rounded-full shadow-sm mb-4">
                <Users className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Одоогоор бүлэгт нэгдээгүй байна</h3>
              <p className="text-muted-foreground mt-2 max-w-sm leading-relaxed">
                Та шинэ бүлэгт нэгдэж эсвэл өөрөө бүлэг үүсгэн хамт олны дэмжлэгийг аваарай.
              </p>
              <Button asChild className="mt-8 rounded-full px-8" size="lg">
                <Link href="/groups">Бүлгүүд харах</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
