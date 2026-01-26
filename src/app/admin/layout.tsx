import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/app-sidebar"
import { UserNav } from "@/components/admin/user-nav"
import { ThemeToggleIcon } from "@/components/ThemeToggleIcon"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: currentUserProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (currentUserProfile?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Хандах эрхгүй</h1>
          <p className="mt-2">Та зөвхөн админ эрхтэй бол энэ хуудсанд хандах боломжтой.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 items-center justify-between border-b px-6 lg:px-10 bg-background">
          <div className="flex items-center gap-4 lg:hidden">
            {/* Mobile menu trigger could go here */}
            <span className="font-bold">Admin</span>
          </div>
          <div className="flex flex-1 justify-end items-center space-x-4">
            <ThemeToggleIcon />
            <UserNav />
          </div>
        </header>
        <main className="flex-1 space-y-4 p-8 pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
