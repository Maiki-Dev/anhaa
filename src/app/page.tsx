import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Nexa Finance
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Бид зээл олгодоггүй, харин бие биенээ дэмжиж, санхүүгийн эрх чөлөөнд хүрэхэд тусалдаг хамт олон юм.
              <br className="hidden sm:inline" />
              Хамтдаа хуримтлуулж, ирээдүйгээ бүтээцгээе.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/signup">
                Нэгдэх <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/login">Нэвтрэх</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Хамт олон</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ижил зорилготой хүмүүстэй нэгдэж, бие биенээ дэмжин санхүүгийн сахилга баттай болоорой.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Хяналт</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Өөрийн ахиц дэвшлийг хянаж, сар бүрийн төлөвлөгөөгөө биелүүлэхэд тань тусална.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Найдвартай</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ил тод, шударга системийг бид эрхэмлэнэ. Бүх зүйл таны хяналтанд байна.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Nexa Finance. Бүх эрх хуулиар хамгаалагдсан.</p>
      </footer>
    </div>
  )
}
