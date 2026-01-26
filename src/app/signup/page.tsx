import { signup } from './actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; error: string }>
}) {
  const params = await searchParams
  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Бүртгүүлэх</CardTitle>
          <CardDescription className="text-center">
            Шинээр бүртгэл үүсгэх
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan_type">Зээлийн төрөл</Label>
              {/* Using native select for now to ensure form submission works easily without client component wrapper */}
              <select
                id="loan_type"
                name="loan_type"
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="bank">Банкны зээл</option>
                <option value="nbfi">ББСБ-ын зээл</option>
                <option value="app">Аппликейшны зээл</option>
              </select>
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

            <Button type="submit" className="w-full">
              Бүртгүүлэх
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Бүртгэлтэй юу?{' '}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Нэвтрэх
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
