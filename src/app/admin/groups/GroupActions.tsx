'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteGroup } from '@/app/groups/actions'
import { toast } from 'sonner'
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

export function GroupActions({ groupId, groupName }: { groupId: string, groupName: string }) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteGroup(groupId)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Бүлэг амжилттай устгагдлаа')
        setIsOpen(false)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Устгах
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Та итгэлтэй байна уу?</DialogTitle>
          <DialogDescription>
            Та "{groupName}" бүлгийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй бөгөөд бүх гишүүд, төлбөрийн мэдээлэл устах болно.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">Болих</Button>
          </DialogClose>
          <Button 
            variant="destructive"
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Устгах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
