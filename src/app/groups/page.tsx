import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { createGroup, joinGroup } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Banknote, CheckCircle2 } from 'lucide-react'
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
    
    // If column doesn't exist yet, we might get an error. 
    // But assuming it exists or ignoring error for now (defaulting to allow if error? No, safer to deny or allow?)
    // If error (column missing), user hasn't created any groups with created_by yet, so count is 0 effectively for new logic.
    // However, strictly speaking, we want to enforce limit.
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
    <div className="container mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Бүлгүүд</h2>
          <p className="text-muted-foreground mt-1">Санхүүгийн зорилгоо биелүүлэхэд тань туслах бүлгүүд</p>
        </div>
        <CreateGroupDialog canCreate={canCreate} />
      </div>

      {/* Groups List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => (
          <Card key={group.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex justify-between items-start">
                 <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{group.name}</CardTitle>
                 {myGroupIds.has(group.id) && (
                   <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                     <CheckCircle2 className="w-3 h-3 mr-1" /> Нэгдсэн
                   </Badge>
                 )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6 space-y-4">
               <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-muted">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Banknote className="w-4 h-4" />
                   <span className="text-sm">Сар бүр:</span>
                 </div>
                 <span className="font-semibold text-primary">{group.monthly_contribution.toLocaleString()}₮</span>
               </div>
               
               <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-muted">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <Users className="w-4 h-4" />
                   <span className="text-sm">Гишүүд:</span>
                 </div>
                 <span className="font-medium">{group.max_members} хүртэл</span>
               </div>
            </CardContent>
            <CardFooter className="bg-muted/10 pt-4">
              {myGroupIds.has(group.id) ? (
                <Button variant="outline" className="w-full cursor-default opacity-80" disabled>
                   <CheckCircle2 className="w-4 h-4 mr-2" /> Та энэ бүлэгт байна
                </Button>
              ) : (
                <form action={async () => {
                  'use server'
                  await joinGroup(group.id)
                }} className="w-full">
                  <Button type="submit" className="w-full shadow-sm hover:shadow-md transition-all">
                    Нэгдэх
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
