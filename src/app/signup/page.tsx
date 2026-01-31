import { signup } from './actions'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PiggyBank } from 'lucide-react'
import { SubmitButton } from '@/components/SubmitButton'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; error: string }>
}) {
  const params = await searchParams
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <Card className="w-full max-w-md shadow-2xl border-primary/10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50"></div>
        <CardHeader className="space-y-2 text-center pb-8 pt-10">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-2">
             <PiggyBank className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Бүртгүүлэх</CardTitle>
          <CardDescription>
            Шинээр бүртгэл үүсгэж эхлээрэй
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Нэр</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Таны нэр"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">И-мэйл хаяг</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Дансны дугаар</Label>
              <Input
                id="account_number"
                name="account_number"
                type="text"
                placeholder="Таны дансны дугаар"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan_type">Зээлийн төрөл</Label>
              {/* Using native select for now to ensure form submission works easily without client component wrapper */}
              <div className="relative">
                <select
                  id="loan_type"
                  name="loan_type"
                  required
                  className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                >
                  <option value="bank">Банкны зээл</option>
                  <option value="nbfi">ББСБ-ын зээл</option>
                  <option value="app">Аппликейшны зээл</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Нууц үг</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="h-11"
              />
            </div>

            {params?.message && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                {params.message}
              </div>
            )}
            {params?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                {params.error}
              </div>
            )}

            <SubmitButton className="w-full h-11 text-base shadow-lg shadow-primary/20">
              Бүртгүүлэх
            </SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm bg-muted/50 py-6 border-t">
          <div className="text-muted-foreground">
            Бүртгэлтэй юу?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
              Нэвтрэх
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
