import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Wallet, ArrowRight, TrendingUp } from 'lucide-react'

export default async function SavingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container max-w-5xl mx-auto py-10 space-y-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-background p-8 border border-primary/10 shadow-lg shadow-primary/5">
           <div className="relative z-10">
              <h1 className="text-2xl font-bold mb-2">Хадгаламж</h1>
              <p className="text-muted-foreground">Та нэвтэрч орно уу.</p>
           </div>
        </div>
      </div>
    )
  }

  // Fetch user's savings accounts
  const { data: members } = await supabase
    .from('savings_members')
    .select('account_id')
    .eq('user_id', user.id)

  const accountIds = members?.map(m => m.account_id) || []

  interface SavingsAccount {
    id: string
    name: string
    created_at: string
    savings_transactions: {
      amount: number
    }[]
  }

  let accounts: SavingsAccount[] = []
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
    <div className="container max-w-5xl mx-auto py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-background p-8 md:p-12 border border-primary/10 shadow-lg shadow-primary/5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse" />
              Хувийн санхүү
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Хадгаламж
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Ирээдүйнхээ төлөө өнөөдрөөс хуримтлуулж эхлээрэй.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
            <Link href="/savings/create">
              <Plus className="mr-2 h-5 w-5" />
              Шинэ хадгаламж
            </Link>
          </Button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-background rounded-full shadow-sm mb-6">
              <Wallet className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Хадгаламж үүсгээгүй байна</h3>
            <p className="text-muted-foreground mt-2 mb-8 text-center max-w-sm leading-relaxed">
              Та гэр бүл, найз нөхөдтэйгөө хамт мөнгө хуримтлуулах эсвэл хувийн зорилгодоо зориулан хадгаламж үүсгээрэй.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/savings/create">Эхлүүлэх</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const totalSaved = account.savings_transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
            
            return (
              <Card key={account.id} className="flex flex-col overflow-hidden border-none shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-card/50 backdrop-blur-sm">
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{account.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        {new Date(account.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full group-hover:scale-110 transition-transform">
                      <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pt-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Нийт хуримтлал</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-foreground">
                        {new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT' }).format(totalSaved)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs text-green-600 font-medium bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-md w-fit">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Идэвхтэй
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-6">
                  <Button asChild className="w-full h-11 shadow-md hover:shadow-lg transition-all rounded-xl group/btn" variant="outline">
                    <Link href={`/savings/${account.id}`}>
                      Дэлгэрэнгүй <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
