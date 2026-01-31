import { login } from './actions'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SubmitButton } from './SubmitButton'
import { PiggyBank } from 'lucide-react'

export default async function LoginPage({
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
          <CardTitle className="text-2xl font-bold tracking-tight">Нэвтрэх</CardTitle>
          <CardDescription>
            Nexa Finance-д тавтай морилно уу
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={login}>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Нууц үг</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  Нууц үгээ мартсан?
                </Link>
              </div>
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

            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm bg-muted/50 py-6 border-t">
          <div className="text-muted-foreground">
            Бүртгэлгүй юу?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
              Бүртгүүлэх
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
