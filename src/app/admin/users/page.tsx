import { createClient } from "@/utils/supabase/server"
import { DataTable } from "@/components/admin/data-table"
import { columns } from "./columns"

export default async function UsersPage() {
  const supabase = await createClient()

  // Fetch users
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")

  if (usersError) {
    console.error("Error fetching users:", usersError)
    return <div>Error loading users</div>
  }

  // Fetch payments and group memberships for all users
  // This is a naive implementation. For production, use joins or RPCs.
  const { data: payments } = await supabase.from("payments").select("user_id, amount")
  const { data: groupMembers } = await supabase.from("group_members").select("user_id, groups(name)")

  const data = users.map((user) => {
    const userPayments = payments?.filter((p) => p.user_id === user.id)
    const totalPayment = userPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    const userGroups = groupMembers
      ?.filter((m) => m.user_id === user.id)
      // @ts-ignore
      .map((m) => m.groups?.name)
      .filter(Boolean) || []

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      total_payment: totalPayment,
      groups: userGroups,
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
