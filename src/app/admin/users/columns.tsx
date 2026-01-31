"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Trash, Shield, Pencil } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteUser, updateUserRole, updateUser } from "./actions"
import { toast } from "sonner"
import { useState } from "react"

export type User = {
  id: string
  email: string
  name: string
  loan_type: string
  role: string
  created_at: string
  total_payment: number
  groups: string[]
  account_number: string
}

const ActionsCell = ({ user }: { user: User }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        name: user.name || '',
        loan_type: user.loan_type || 'bank',
        account_number: user.account_number || '',
        email: user.email || ''
    })

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

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        
        const result = await updateUser(user.id, editForm)
        
        setIsLoading(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("User updated successfully")
            setIsEditDialogOpen(false)
        }
    }

    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            
            <DialogTrigger asChild>
                <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit User
                </DropdownMenuItem>
            </DialogTrigger>

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

        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
                Make changes to the user's profile here. Click save when you're done.
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        value={editForm.email} 
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                        id="name" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input 
                        id="account_number" 
                        value={editForm.account_number} 
                        onChange={(e) => setEditForm({...editForm, account_number: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="loan_type">Loan Type</Label>
                    <div className="relative">
                        <select
                            id="loan_type"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                            value={editForm.loan_type}
                            onChange={(e) => setEditForm({...editForm, loan_type: e.target.value})}
                        >
                            <option value="bank">Банкны зээл</option>
                            <option value="nbfi">ББСБ-ын зээл</option>
                            <option value="app">Аппликейшны зээл</option>
                        </select>
                         <div className="absolute right-3 top-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
        </Dialog>
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
    accessorKey: "account_number",
    header: "Account No",
    cell: ({ row }) => row.getValue("account_number") || "-",
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
