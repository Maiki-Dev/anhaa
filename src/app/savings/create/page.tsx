import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, PiggyBank } from 'lucide-react'
import Link from 'next/link'

export default async function CreateSavingsPage() {
  async function createSavings(formData: FormData) {
    'use server'
    
    const name = formData.get('name') as string
    if (!name) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Create account
    const { data: account, error: accountError } = await supabase
      .from('savings_accounts')
      .insert({ 
        name,
        created_by: user.id
      })
      .select()
      .single()

    if (accountError || !account) {
      console.error('Error creating account:', accountError)
      return
    }

    // 2. Add creator as member
    const { error: memberError } = await supabase
      .from('savings_members')
      .insert({
        account_id: account.id,
        user_id: user.id
      })

    if (memberError) {
      console.error('Error adding member:', memberError)
      return
    }

    redirect(`/savings/${account.id}`)
  }

  return (
    <div className="container mx-auto p-6 max-w-xl py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary transition-colors">
          <Link href="/savings" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Буцах
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl opacity-50" />
        
        <CardHeader className="space-y-4 pb-6 text-center">
          <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-2">
            <PiggyBank className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">Шинэ хадгаламж үүсгэх</CardTitle>
            <CardDescription>
              Танд болон таны гэр бүлд зориулсан хуримтлалын сан
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form action={createSavings} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Хадгаламжийн нэр</Label>
              <Input
                id="name"
                name="name"
                placeholder="Жишээ: Гэр бүлийн хадгаламж, Аяллын сан..."
                required
                className="h-12 text-lg bg-background/50"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              Үүсгэх
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
