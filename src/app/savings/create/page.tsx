import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Шинэ хадгаламж үүсгэх</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSavings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Хадгаламжийн нэр</Label>
              <Input
                id="name"
                name="name"
                placeholder="Жишээ: Гэр бүлийн хадгаламж"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Үүсгэх
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
