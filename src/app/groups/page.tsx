import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { joinGroup } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Banknote, CheckCircle2, ArrowRight, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog'

export default async function GroupsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check creation limit
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const isAdmin = profile?.role === 'admin'
  let canCreate = true

  if (!isAdmin) {
    const { count, error } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id)
    
    if (!error && (count || 0) >= 1) {
      canCreate = false
    }
  }

  // Fetch all groups
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch my memberships to check status
  const { data: myMemberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const myGroupIds = new Set(myMemberships?.map((m) => m.group_id))

  return (
    <div className="container max-w-5xl mx-auto py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-background p-8 md:p-12 border border-primary/10 shadow-lg shadow-primary/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-green-500/10 blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Хамтын хуримтлал
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Бүлгүүд
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Санхүүгийн зорилгоо биелүүлэхэд тань туслах бүлгүүдтэй нэгдээрэй.
            </p>
          </div>
          <CreateGroupDialog canCreate={canCreate} isAdmin={isAdmin} />
        </div>
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => (
          <Card key={group.id} className="flex flex-col overflow-hidden border-none shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-card/50 backdrop-blur-sm">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary/50 to-primary" />
            <CardHeader className="pb-4 relative">
              <div className="flex justify-between items-start">
                 <div>
                   <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{group.name}</CardTitle>
                   <CardDescription className="mt-1">
                      {new Date(group.created_at).toLocaleDateString('mn-MN', { timeZone: 'Asia/Ulaanbaatar' })}
                   </CardDescription>
                 </div>
                 {myGroupIds.has(group.id) && (
                   <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                     <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                   </div>
                 )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-2 space-y-5">
               <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group-hover:bg-muted/80 transition-colors">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Banknote className="w-4 h-4" />
                   <span className="text-sm font-medium">Сар бүр:</span>
                 </div>
                 <span className="font-bold text-primary text-lg">{group.monthly_contribution.toLocaleString()}₮</span>
               </div>
               
               <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group-hover:bg-muted/80 transition-colors">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Users className="w-4 h-4" />
                   <span className="text-sm font-medium">Гишүүд:</span>
                 </div>
                 <Badge variant="outline" className="bg-background">
                    {group.max_members} хүртэл
                 </Badge>
               </div>
            </CardContent>
            <CardFooter className="pt-2 pb-6">
              {myGroupIds.has(group.id) ? (
                <Button variant="outline" className="w-full h-11 cursor-default bg-green-50/50 hover:bg-green-50/50 border-green-200 text-green-700" disabled>
                   <CheckCircle2 className="w-4 h-4 mr-2" /> Та энэ бүлэгт байна
                </Button>
              ) : (
                <form action={async () => {
                  'use server'
                  await joinGroup(group.id)
                }} className="w-full">
                  <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl group/btn">
                    Нэгдэх <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </form>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
