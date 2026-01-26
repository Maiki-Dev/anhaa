import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { revalidatePath } from 'next/cache'

import { AddMemberForm } from './AddMemberForm'

export default async function SavingsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return notFound()

  // Verify membership
  const { data: member } = await supabase
    .from('savings_members')
    .select('id')
    .eq('account_id', id)
    .eq('user_id', user.id)
    .single()

  if (!member) return notFound()

  // Fetch account details
  const { data: account } = await supabase
    .from('savings_accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (!account) return notFound()

  // Fetch transactions with user details
  const { data: transactions } = await supabase
    .from('savings_transactions')
    .select(`
      *,
      users (
        name,
        email
      )
    `)
    .eq('account_id', id)
    .order('created_at', { ascending: false })

  const totalSaved = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0

  async function addDeposit(formData: FormData) {
    'use server'
    const amount = formData.get('amount')
    if (!amount) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('savings_transactions').insert({
      account_id: id,
      user_id: user.id,
      amount: Number(amount),
      payment_method: 'manual' // Or specific method
    })

    revalidatePath(`/savings/${id}`)
  }

  async function addMember(formData: FormData): Promise<{ error?: string; success?: boolean }> {
    'use server'
    const email = formData.get('email') as string
    if (!email) return { error: 'Имэйл оруулна уу' }

    const supabase = await createClient()
    
    // Find user by email
    const { data: foundUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{account.name}</h1>
          <p className="text-muted-foreground">Хамтын хадгаламж</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Нийт хадгаламж</p>
          <p className="text-3xl font-bold text-primary">
            {new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT' }).format(totalSaved)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Deposit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Мөнгө нэмэх</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={addDeposit} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="amount" className="sr-only">Дүн</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Мөнгөн дүн"
                  required
                  min="1"
                />
              </div>
              <Button type="submit">Нэмэх</Button>
            </form>
          </CardContent>
        </Card>

        {/* Add Member Form */}
        <Card>
          <CardHeader>
            <CardTitle>Гишүүн нэмэх</CardTitle>
          </CardHeader>
          <CardContent>
            <AddMemberForm onAddMember={addMember} />
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Гүйлгээний түүх</CardTitle>
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
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
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
                    <TableCell>{t.users?.name || t.users?.email}</TableCell>
                    <TableCell className="text-right font-medium">
                      +{new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT' }).format(t.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
