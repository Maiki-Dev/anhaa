import { createClient } from "@/utils/supabase/server"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./columns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default async function UsersPage() {
  const supabase = await createClient()

  // Fetch users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order('created_at', { ascending: false })

  if (usersError) {
    console.error("Error fetching users:", usersError)
    return <div>Error loading users</div>
  }

  // Fetch payments and group memberships for all users
  const { data: payments } = await supabase.from("payments").select("user_id, amount")
  const { data: groupMembers } = await supabase.from("group_members").select("user_id, groups(name)")

  const data = users.map((user) => {
    const userPayments = payments?.filter((p) => p.user_id === user.id)
    const totalPayment = userPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    const userGroups = groupMembers
      ?.filter((m) => m.user_id === user.id)
      // @ts-expect-error - Supabase type inference for nested relations can be tricky
      .map((m) => m.groups?.name)
      .filter(Boolean) || []

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      loan_type: user.loan_type,
      role: user.role,
      created_at: user.created_at,
      total_payment: totalPayment,
      groups: userGroups,
      account_number: user.account_number,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Хэрэглэгчид</h2>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Нийт хэрэглэгчид</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Хэрэглэгчдийн жагсаалт</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  )
}
