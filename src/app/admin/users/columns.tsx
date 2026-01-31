"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Trash, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { deleteUser, updateUserRole } from "./actions"
import { toast } from "sonner"
import { useState } from "react"

export type User = {
  id: string
  email: string
  role: string
  created_at: string
  total_payment: number
  groups: string[]
}

const ActionsCell = ({ user }: { user: User }) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

        setIsLoading(true)
        const result = await deleteUser(user.id)
        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("User deleted successfully")
        }
    }

    const handleRoleUpdate = async (newRole: string) => {
        setIsLoading(true)
        const result = await updateUserRole(user.id, newRole)
        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`Role updated to ${newRole}`)
        }
    }

    return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(user.id)
                toast.success("User ID copied")
              }}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Shield className="mr-2 h-4 w-4" />
                Change Role
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={user.role} onValueChange={handleRoleUpdate}>
                  <DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>
    },
  },
  {
    accessorKey: "total_payment",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Payment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_payment"))
      // Use decimal style and append symbol manually to avoid server/client currency symbol mismatch (MNT vs ₮)
      const formatted = new Intl.NumberFormat("mn-MN", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted} ₮</div>
    },
  },
  {
    accessorKey: "groups",
    header: "Groups",
    cell: ({ row }) => {
      const groups = row.getValue("groups") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {groups.map((group) => (
            <Badge key={group} variant="outline">
              {group}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        // Manually format to YYYY.MM.DD using Asia/Ulaanbaatar timezone to avoid hydration mismatch
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Ulaanbaatar',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
        const parts = formatter.formatToParts(date)
        const year = parts.find(p => p.type === 'year')?.value
        const month = parts.find(p => p.type === 'month')?.value
        const day = parts.find(p => p.type === 'day')?.value
        
        return `${year}.${month}.${day}`
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
]
