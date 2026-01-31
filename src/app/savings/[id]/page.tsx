import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DepositSection } from './DepositSection'
import { AddMemberForm } from './AddMemberForm'
import { MembersList } from './MembersList'
import { ChatSection } from './ChatSection'
import { Wallet, Users, MessageSquare, History, PiggyBank, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function SavingsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return notFound()

  // Verify membership and fetch initial data in parallel
  const [
    { data: member },
    { data: account },
    { data: transactions },
    { data: members },
    { data: messages }
  ] = await Promise.all([
    supabase
      .from('savings_members')
      .select('id')
      .eq('account_id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('savings_accounts')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('savings_transactions')
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .eq('account_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('savings_members')
      .select('*, users(name, email)')
      .eq('account_id', id),
    supabase
      .from('savings_messages')
      .select('*, users(name)')
      .eq('account_id', id)
      .order('created_at', { ascending: true })
  ])

  if (!member || !account) return notFound()

  const totalSaved = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

  async function addMember(formData: FormData): Promise<{ error?: string; success?: boolean }> {
    'use server'
    const rawEmail = formData.get('email') as string
    if (!rawEmail) return { error: 'Имэйл оруулна уу' }
    
    const email = rawEmail.trim().toLowerCase()

    const supabase = await createClient()
    
    // Find user by email
    const { data: foundUser } = await supabase
      .from('users')
      .select('id')
      .ilike('email', email)
      .single()
    
    if (!foundUser) {
      return { error: 'Хэрэглэгч олдсонгүй' }
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('savings_members')
      .select('id')
      .eq('account_id', id)
      .eq('user_id', foundUser.id)
      .single()

    if (existingMember) {
      return { error: 'Аль хэдийн гишүүн болсон байна' }
    }

    const { error: insertError } = await supabase.from('savings_members').insert({
      account_id: id,
      user_id: foundUser.id,
      status: 'invited'
    })

    if (insertError) {
      console.error('Error adding member:', insertError)
      return { error: 'Гишүүн нэмэхэд алдаа гарлаа' }
    }

    // Create notification
    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: foundUser.id,
      type: 'savings_invite',
      title: 'Хадгаламжийн урилга',
      message: `"${account.name}" хадгаламжид нэгдэх урилга ирлээ.`,
      data: { account_id: id, account_name: account.name }
    })
    
    if (notifError) {
      console.error('Error creating notification:', notifError)
    }

    revalidatePath(`/savings/${id}`)
    return { success: true }
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Back Button */}
      <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors">
        <Link href="/savings" className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          Хадгаламжийн жагсаалт руу буцах
        </Link>
      </Button>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-background p-8 md:p-10 border border-primary/10 shadow-lg shadow-primary/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-background/60 backdrop-blur-sm rounded-2xl shadow-sm border border-primary/10">
              <PiggyBank className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{account.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-muted-foreground font-medium">Хамтын хадгаламж</p>
              </div>
            </div>
          </div>
          
          <div className="text-left md:text-right bg-background/40 backdrop-blur-md p-4 rounded-2xl border border-primary/5">
            <p className="text-sm font-medium text-muted-foreground mb-1">Нийт хадгаламж</p>
            <p className="text-4xl font-extrabold text-foreground tracking-tight">
              {new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT' }).format(totalSaved)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area - Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="chat" className="rounded-lg h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Чат
              </TabsTrigger>
              <TabsTrigger value="transactions" className="rounded-lg h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <History className="w-4 h-4 mr-2" />
                Гүйлгээний түүх
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-0 focus-visible:outline-none">
              <div className="h-[600px] border border-border/50 rounded-2xl overflow-hidden shadow-sm bg-card/50 backdrop-blur-sm">
                <ChatSection 
                  accountId={id} 
                  initialMessages={messages || []} 
                  currentUserId={user.id} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0 focus-visible:outline-none">
              <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-muted/20">
                  <CardTitle>Гүйлгээний түүх</CardTitle>
                  <CardDescription>Сүүлийн үеийн бүх орлого зарлагын мэдээлэл</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/10">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6">Огноо</TableHead>
                        <TableHead>Хэрэглэгч</TableHead>
                        <TableHead className="text-right pr-6">Дүн</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                            Гүйлгээ хийгдээгүй байна
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions?.map((t) => (
                          <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-6">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {new Date(t.created_at).toLocaleDateString('mn-MN')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(t.created_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                  {(t.users?.name || t.users?.email || '?').charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{t.users?.name || t.users?.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-emerald-600 pr-6">
                              +{new Intl.NumberFormat('mn-MN', { style: 'decimal' }).format(Number(t.amount))}₮
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Right Side (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Action Card */}
          <Card className="border-none shadow-md bg-gradient-to-b from-card to-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/5 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="w-5 h-5 text-primary" />
                Түрийвч
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <DepositSection accountId={id} />
            </CardContent>
          </Card>

          {/* Members Card */}
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-muted/20 pb-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-muted-foreground" />
                Гишүүд
              </CardTitle>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                {members?.length || 0}
              </span>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <MembersList members={members || []} />
              
              <div className="pt-6 border-t border-dashed">
                <p className="text-sm font-medium mb-3 text-muted-foreground">Шинэ гишүүн урих</p>
                <AddMemberForm onAddMember={addMember} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
