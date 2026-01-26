import { login } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; error: string }>
}) {
  const params = await searchParams
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Нэвтрэх</CardTitle>
          <CardDescription className="text-center">
            И-мэйл болон нууц үгээ оруулан нэвтэрнэ үү
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">И-мэйл хаяг</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Нууц үг</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>

            {params?.message && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md dark:bg-green-900/30 dark:text-green-400">
                {params.message}
              </div>
            )}
            {params?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/30 dark:text-red-400">
                {params.error}
              </div>
            )}

            <Button formAction={login} className="w-full">
              Нэвтрэх
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Бүртгэлгүй юу?{' '}
            <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
              Бүртгүүлэх
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
