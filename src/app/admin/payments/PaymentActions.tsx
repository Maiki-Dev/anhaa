'use client'

import { updatePaymentStatus, deletePayment, updatePaymentDetails } from './actions'
import { Button } from '@/components/ui/button'
import { Check, X, MoreHorizontal, Trash2, Edit, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface PaymentActionsProps {
  paymentId: string
  status: string
  amount: number
  note: string | null
}

export function PaymentActions({ paymentId, status, amount, note }: PaymentActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editAmount, setEditAmount] = useState(amount)
  const [editNote, setEditNote] = useState(note || '')

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deletePayment(paymentId)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Төлбөр амжилттай устгагдлаа')
        setShowDeleteDialog(false)
      }
    })
  }

  const handleEdit = async () => {
    startTransition(async () => {
      const result = await updatePaymentDetails(paymentId, editAmount, editNote)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Төлбөр амжилттай шинэчлэгдлээ')
        setShowEditDialog(false)
      }
    })
  }

  const handleStatusUpdate = (newStatus: 'approved' | 'rejected') => {
    startTransition(async () => {
      const result = await updatePaymentStatus(paymentId, newStatus)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(newStatus === 'approved' ? 'Төлбөр баталгаажлаа' : 'Төлбөр цуцлагдлаа')
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {status === 'pending' && (
          <>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => handleStatusUpdate('approved')}
              disabled={isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
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
            
            {status !== 'pending' && (
               <DropdownMenuItem onClick={() => handleStatusUpdate(status === 'approved' ? 'rejected' : 'approved')}>
                 {status === 'approved' ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                 {status === 'approved' ? 'Цуцлах' : 'Баталгаажуулах'}
               </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Устгах
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Та итгэлтэй байна уу?</DialogTitle>
            <DialogDescription>
              Та энэ төлбөрийн бүртгэлийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.
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
            <DialogTitle>Төлбөр засах</DialogTitle>
            <DialogDescription>
              Төлбөрийн мэдээллийг шинэчлэх.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Дүн</Label>
              <Input 
                id="amount" 
                type="number" 
                value={editAmount} 
                onChange={(e) => setEditAmount(parseFloat(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Тэмдэглэл</Label>
              <Textarea 
                id="note" 
                value={editNote} 
                onChange={(e) => setEditNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Болих</Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Хадгалах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
