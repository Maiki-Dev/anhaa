import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Wallet } from 'lucide-react'

export default async function SavingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Хадгаламж</h1>
        <p>Та нэвтэрч орно уу.</p>
      </div>
    )
  }

  // Fetch user's savings accounts
  const { data: members } = await supabase
    .from('savings_members')
    .select('account_id')
    .eq('user_id', user.id)

  const accountIds = members?.map(m => m.account_id) || []

  let accounts: any[] = []
  if (accountIds.length > 0) {
    const { data: savingsAccounts } = await supabase
      .from('savings_accounts')
      .select(`
        id,
        name,
        created_at,
        savings_transactions (
          amount
        )
      `)
      .in('id', accountIds)
      .order('created_at', { ascending: false })
    
    accounts = savingsAccounts || []
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Хадгаламж</h1>
        <Button asChild>
          <Link href="/savings/create">
            <Plus className="mr-2 h-4 w-4" />
            Шинэ хадгаламж
          </Link>
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Хадгаламж үүсгээгүй байна</p>
            <p className="text-muted-foreground mb-4 text-center max-w-sm">
              Та гэр бүл, найз нөхөдтэйгөө хамт мөнгө хуримтлуулах хадгаламж үүсгээрэй.
            </p>
            <Button asChild>
              <Link href="/savings/create">Эхлүүлэх</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const totalSaved = account.savings_transactions?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0
            
            return (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {account.name}
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT' }).format(totalSaved)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Нийт хуримтлал
                  </p>
                  <Button asChild className="w-full mt-4" variant="outline">
                    <Link href={`/savings/${account.id}`}>
                      Дэлгэрэнгүй
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
