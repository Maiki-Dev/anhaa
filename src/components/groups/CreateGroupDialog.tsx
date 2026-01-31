'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Info } from 'lucide-react'
import { createGroup } from '@/app/groups/actions'
import { toast } from 'sonner'

interface CreateGroupDialogProps {
  canCreate: boolean
  isAdmin: boolean
}

export function CreateGroupDialog({ canCreate, isAdmin }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      const result = await createGroup(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setOpen(false)
        toast.success('Бүлэг амжилттай үүсгэгдлээ')
      }
    } catch (error) {
      console.error(error)
      toast.error('Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground bg-muted px-4 py-2 rounded-md border">
        <Info className="w-4 h-4" />
        <span className="text-sm">Та зөвхөн 1 бүлэг үүсгэх эрхтэй</span>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Шинэ бүлэг үүсгэх
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Шинэ бүлэг үүсгэх</DialogTitle>
          <DialogDescription>
            Өөрийн хэрэгцээнд тохирсон дэмжлэгийн бүлгийг үүсгээрэй.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Нэр
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Жишээ: Аялалын сан"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthly_contribution" className="text-right">
                Хураамж
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="monthly_contribution"
                  name="monthly_contribution"
                  type="number"
                  placeholder="50,000"
                  className="pl-8"
                  required
                  max={isAdmin ? undefined : 50000}
                  onInvalid={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.validity.rangeOverflow && !isAdmin) {
                      target.setCustomValidity("Хураамж 50,000-аас ихгүй байх ёстой");
                    } else if (target.validity.valueMissing) {
                      target.setCustomValidity("Хураамжийн дүнг оруулна уу");
                    }
                  }}
                  onInput={(e) => {
                    (e.target as HTMLInputElement).setCustomValidity("");
                  }}
                />
                <span className="absolute left-3 top-2.5 text-muted-foreground">₮</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_members" className="text-right">
                Гишүүд
              </Label>
              <Input
                id="max_members"
                name="max_members"
                type="number"
                placeholder="20 хүртэл"
                className="col-span-3"
                min={1}
                max={isAdmin ? undefined : 20}
                required
                onInvalid={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.validity.rangeOverflow && !isAdmin) {
                    target.setCustomValidity("Гишүүдийн тоо 20-оос ихгүй байх ёстой");
                  } else if (target.validity.rangeUnderflow) {
                    target.setCustomValidity("Гишүүдийн тоо 1-ээс багагүй байх ёстой");
                  } else if (target.validity.valueMissing) {
                    target.setCustomValidity("Гишүүдийн тоог оруулна уу");
                  }
                }}
                onInput={(e) => {
                  (e.target as HTMLInputElement).setCustomValidity("");
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Үүсгэж байна...' : 'Үүсгэх'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
