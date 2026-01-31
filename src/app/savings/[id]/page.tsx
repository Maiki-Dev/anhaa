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
import { Wallet, Users, MessageSquare, History, PiggyBank } from 'lucide-react'

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
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <PiggyBank className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{account.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Хамтын хадгаламж
            </p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm font-medium text-muted-foreground">Нийт хадгаламж</p>
          <p className="text-3xl font-bold text-primary tracking-tight">
            {new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT' }).format(totalSaved)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area - Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Чат
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Гүйлгээний түүх
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-0">
              <div className="h-[600px] border rounded-xl overflow-hidden shadow-sm bg-card">
                <ChatSection 
                  accountId={id} 
                  initialMessages={messages || []} 
                  currentUserId={user.id} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="transactions" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Гүйлгээний түүх</CardTitle>
                  <CardDescription>Сүүлийн үеийн бүх орлого зарлагын мэдээлэл</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Огноо</TableHead>
                        <TableHead>Хэрэглэгч</TableHead>
                        <TableHead className="text-right">Дүн</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            Гүйлгээ хийгдээгүй байна
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions?.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              {new Date(t.created_at).toLocaleDateString('mn-MN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="font-medium">{t.users?.name || t.users?.email}</TableCell>
                            <TableCell className="text-right font-bold text-green-600">
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
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-primary/5 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Түрийвч
              </h3>
            </div>
            <div className="p-4">
              <DepositSection accountId={id} />
            </div>
          </div>

          {/* Members Card */}
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-secondary/30 border-b flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Гишүүд
              </h3>
              <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded-full">
                {members?.length || 0}
              </span>
            </div>
            <div className="p-4 space-y-4">
              <MembersList members={members || []} />
              
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2 text-muted-foreground">Шинэ гишүүн урих</p>
                <AddMemberForm onAddMember={addMember} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
