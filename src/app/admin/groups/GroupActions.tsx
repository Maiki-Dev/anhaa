'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Trash2, Edit, Loader2 } from 'lucide-react'
import { deleteGroup, updateGroup } from '@/app/groups/actions'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface GroupActionsProps {
  groupId: string
  groupName: string
  contribution: number
  maxMembers: number
}

export function GroupActions({ groupId, groupName, contribution, maxMembers }: GroupActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteGroup(groupId)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Бүлэг амжилттай устгагдлаа')
        setShowDeleteDialog(false)
      }
    })
  }

  const handleEdit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateGroup(groupId, formData)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Бүлэг амжилттай шинэчлэгдлээ')
        setShowEditDialog(false)
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Үйлдэл</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Засах
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Устгах
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Та итгэлтэй байна уу?</DialogTitle>
            <DialogDescription>
              Та "{groupName}" бүлгийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй бөгөөд бүх гишүүд, төлбөрийн мэдээлэл устах болно.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Болих</Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Бүлэг засах</DialogTitle>
            <DialogDescription>
              Бүлгийн мэдээллийг шинэчлэх.
            </DialogDescription>
          </DialogHeader>
          <form action={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Нэр</Label>
                <Input id="name" name="name" defaultValue={groupName} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monthly_contribution">Сар бүрийн хураамж</Label>
                <Input 
                  id="monthly_contribution" 
                  name="monthly_contribution" 
                  type="number" 
                  defaultValue={contribution} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_members">Гишүүдийн тоо</Label>
                <Input 
                  id="max_members" 
                  name="max_members" 
                  type="number" 
                  defaultValue={maxMembers} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowEditDialog(false)}>Болих</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Хадгалах
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
