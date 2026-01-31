import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, TrendingUp, ShieldCheck, ArrowRight, PiggyBank, BarChart3, Lock } from 'lucide-react'

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
      <section className="relative flex-1 flex flex-col items-center justify-center py-32 text-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Шинэ үеийн санхүүгийн шийдэл
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Nexa Finance
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed md:text-2xl">
            Хамтдаа хуримтлуулж, бие биенээ дэмжин санхүүгийн эрх чөлөөнд хүрэх зам.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              <Link href="/signup">
                Эхлэх <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full hover:bg-secondary/50 transition-all">
              <Link href="/login">Нэвтрэх</Link>
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-primary">100+</h3>
              <p className="text-sm text-muted-foreground">Идэвхтэй хэрэглэгч</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-primary">50M+</h3>
              <p className="text-sm text-muted-foreground">Хадгаламж</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-primary">24/7</h3>
              <p className="text-sm text-muted-foreground">Дэмжлэг</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-primary">100%</h3>
              <p className="text-sm text-muted-foreground">Найдвартай</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Бидний давуу тал</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Санхүүгийн зорилгодоо хүрэхэд тань туслах шилдэг хэрэгслүүд
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group relative overflow-hidden border-muted bg-card transition-all hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-8 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">Хамт олон</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ижил зорилготой хүмүүстэй нэгдэж, бие биенээ дэмжин санхүүгийн сахилга баттай болоорой.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-muted bg-card transition-all hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-8 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">Хяналт</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Өөрийн ахиц дэвшлийг нарийн хянаж, сар бүрийн төлөвлөгөөгөө биелүүлэхэд тань тусална.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-muted bg-card transition-all hover:shadow-2xl hover:border-primary/50 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-8 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold">Найдвартай</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ил тод, шударга системийг бид эрхэмлэнэ. Бүх зүйл таны хяналтанд байна.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Санхүүгийн аяллаа өнөөдөр эхлүүл
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Хүсэл мөрөөдөлдөө хүрэх эхний алхмаа хийгээрэй.
          </p>
          <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20">
            <Link href="/signup">
              Бүртгүүлэх
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Nexa Finance</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nexa Finance. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Үйлчилгээний нөхцөл</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Нууцлалын бодлого</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
