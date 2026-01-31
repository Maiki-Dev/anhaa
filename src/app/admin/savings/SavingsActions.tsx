'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { deleteSavings, updateSavings } from './actions'

interface SavingsActionsProps {
  savings: {
    id: string
    name: string
  }
}

export function SavingsActions({ savings }: SavingsActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [newName, setNewName] = useState(savings.name)

  async function handleDelete() {
    setIsPending(true)
    try {
      const result = await deleteSavings(savings.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Хадгаламж амжилттай устгагдлаа')
        setShowDeleteDialog(false)
      }
    } catch (error) {
      toast.error('Алдаа гарлаа')
    } finally {
      setIsPending(false)
    }
  }

  async function handleUpdate() {
    setIsPending(true)
    try {
      const result = await updateSavings(savings.id, newName)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Хадгаламж амжилттай шинэчлэгдлээ')
        setShowEditDialog(false)
      }
    } catch (error) {
      toast.error('Алдаа гарлаа')
    } finally {
      setIsPending(false)
    }
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
            <Pencil className="mr-2 h-4 w-4" />
            Засах
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Устгах
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хадгаламж устгах</DialogTitle>
            <DialogDescription>
              Та "{savings.name}" хадгаламжийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isPending}>
              Болих
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Устгаж байна...' : 'Устгах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хадгаламж засах</DialogTitle>
            <DialogDescription>
              Хадгаламжийн мэдээллийг өөрчлөх
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Нэр
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isPending}>
              Болих
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
