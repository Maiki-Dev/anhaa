import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { submitPayment } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch group details
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (error || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Бүлэг олдсонгүй</h2>
          <Button asChild>
            <Link href="/dashboard">Буцах</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-lg mx-auto py-12">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Төлбөр төлөх</CardTitle>
          <CardDescription>{group.name} бүлгийн сарын хураамж</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Төлөх дүн</span>
            <span className="text-2xl font-bold text-primary">{group.monthly_contribution.toLocaleString()}₮</span>
          </div>

          <Tabs defaultValue="qpay" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qpay">QPay</TabsTrigger>
              <TabsTrigger value="bank">Дансаар</TabsTrigger>
            </TabsList>
            
            <TabsContent value="qpay" className="space-y-4 pt-4">
              <div className="text-center space-y-4">
                <div className="bg-white border-2 border-dashed w-48 h-48 mx-auto flex items-center justify-center rounded-lg shadow-sm">
                  <span className="text-muted-foreground text-xs">QR Code Placeholder</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  QPay ашиглан төлбөрөө хялбар, хурдан төлнө үү.
                </p>
                
                <form action={async () => {
                  'use server'
                  await submitPayment(groupId, 'qpay', 'QPay QR payment')
                }}>
                  <Button className="w-full" size="lg" type="submit">
                    Төлбөр шалгах
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="bank" className="space-y-4 pt-4">
              <div className="space-y-4 border rounded-lg p-4">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Банк</Label>
                  <div className="font-medium">ХААН Банк</div>
                </div>
                <Separator />
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Дансны дугаар</Label>
                  <div className="flex items-center justify-between">
                    <code className="bg-muted px-2 py-1 rounded border font-mono text-lg">5063568372</code>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Хүлээн авагч</Label>
                  <div className="font-medium">Анхбаяр (Nexa Finance)</div>
                </div>
                <Separator />
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Гүйлгээний утга</Label>
                  <div className="bg-yellow-50 px-3 py-2 rounded border border-yellow-200 text-sm text-yellow-800 break-all">
                    {user.email}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    * Гүйлгээний утга дээр бүртгэлтэй и-мэйл хаягаа заавал бичнэ үү.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-md flex gap-2 items-start text-blue-800 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>Дансаар шилжүүлсэн тохиолдолд админ баталгаажуулсны дараа төлөв шинэчлэгдэнэ.</p>
              </div>

              <form action={async () => {
                'use server'
                await submitPayment(groupId, 'bank_transfer', 'Bank transfer manual confirmation')
              }}>
                <Button className="w-full" size="lg" type="submit" variant="secondary">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Шилжүүлэг хийсэн
                </Button>
              </form>
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>
    </div>
  )
}
