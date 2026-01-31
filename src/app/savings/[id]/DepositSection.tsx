'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { addDeposit } from './actions'
import { toast } from 'sonner'
import { QrCode, Loader2, CheckCircle2 } from 'lucide-react'

const PRESET_AMOUNTS = [5000, 10000, 20000, 40000, 60000]

export function DepositSection({ accountId }: { accountId: string }) {
  const [amount, setAmount] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'initial' | 'processing' | 'success'>('initial')
  const [loading, setLoading] = useState(false)

  const handlePresetClick = (value: number) => {
    setAmount(value.toString())
  }

  const handlePayClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) {
      toast.error('Мөнгөн дүнгээ оруулна уу')
      return
    }
    setPaymentStep('initial')
    setIsModalOpen(true)
  }

  const processPayment = async () => {
    setLoading(true)
    setPaymentStep('processing')
    
    // Simulate payment processing (Od system / QPay API call)
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const result = await addDeposit(accountId, Number(amount))
      if (result.error) {
        toast.error(result.error)
        setIsModalOpen(false)
      } else {
        setPaymentStep('success')
        toast.success('Төлбөр амжилттай хийгдлээ')
        setAmount('')
        // Close modal after showing success for a moment
        setTimeout(() => {
          setIsModalOpen(false)
          setPaymentStep('initial')
        }, 2000)
      }
    } catch (error) {
      console.error(error)
      toast.error('Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мөнгө нэмэх</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset.toString() ? 'default' : 'outline'}
                onClick={() => handlePresetClick(preset)}
                className="flex-1 min-w-[80px]"
              >
                {preset.toLocaleString()}₮
              </Button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="amount" className="sr-only">Дүн</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Мөнгөн дүн"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
              />
            </div>
            <Button type="button" onClick={handlePayClick}>Төлөх</Button>
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Төлбөр төлөх</DialogTitle>
              <DialogDescription>
                Od Payment System
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center p-6 space-y-4">
              {paymentStep === 'initial' && (
                <>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold">{Number(amount).toLocaleString()}₮</p>
                    <p className="text-sm text-muted-foreground">QR кодыг уншуулж төлбөрөө төлнө үү</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <QrCode className="w-32 h-32 text-slate-800" />
                  </div>
                  
                  <Button onClick={processPayment} className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Төлбөр шалгах
                  </Button>
                </>
              )}

              {paymentStep === 'processing' && (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <p>Төлбөрийг шалгаж байна...</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="flex flex-col items-center py-8 text-green-600">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="text-lg font-bold">Амжилттай!</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
