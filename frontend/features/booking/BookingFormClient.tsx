'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { roomsApi, reservationsApi } from '@/api'
import { Input, Button, FullPageSpinner } from '@/components/ui'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, nightsBetween, minCheckInDate, minCheckOutDate } from '@/utils/dateHelpers'
import { CheckCircle, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

const schema = z.object({
  checkInDate: z.string().min(1, 'Check-in date required'),
  checkOutDate: z.string().min(1, 'Check-out date required'),
  numAdults: z.number().min(1).max(10),
  numChildren: z.number().min(0).max(10),
  specialRequests: z.string().max(1000).optional(),
})

type FormData = z.infer<typeof schema>

export function BookingFormClient({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [bookingId, setBookingId] = useState('')

  const { data: roomData, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomsApi.getById(roomId).then((r) => r.data.data),
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      checkInDate: searchParams.get('checkIn') || '',
      checkOutDate: searchParams.get('checkOut') || '',
      numAdults: Number(searchParams.get('adults') || 1),
      numChildren: Number(searchParams.get('children') || 0),
    },
  })

  const checkIn = watch('checkInDate')
  const checkOut = watch('checkOutDate')
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0
  const totalPrice = roomData ? roomData.pricePerNight * nights : 0
  const taxes = totalPrice * 0.12

  const onSubmit = async (data: FormData) => {
    try {
      const res = await reservationsApi.create({
        roomId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numAdults: data.numAdults,
        numChildren: data.numChildren,
        specialRequests: data.specialRequests,
      })
      setBookingId(res.data.data.id)
      setSuccess(true)
      toast.success('Booking confirmed!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.')
    }
  }

  if (isLoading) return <FullPageSpinner />

  if (success) {
    return (
      <div className="page-container max-w-lg text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Booking Confirmed!</h1>
        <p className="text-stone-500 mb-6">
          Your reservation has been created. Reference: <span className="font-mono font-semibold text-stone-700">{bookingId.slice(0, 8).toUpperCase()}</span>
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/account/bookings" className="btn-primary">View My Bookings</Link>
          <Link href="/rooms" className="btn-secondary">Browse More Rooms</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container max-w-5xl">
      <Link href={`/rooms/${roomId}`} className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6">
        <ArrowLeft size={16} /> Back to room
      </Link>

      <h1 className="font-display text-2xl font-bold text-stone-900 mb-8">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Stay Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Check-in Date</label>
                  <input
                    type="date"
                    min={minCheckInDate()}
                    className="input-field"
                    {...register('checkInDate')}
                  />
                  {errors.checkInDate && <p className="mt-1 text-xs text-red-500">{errors.checkInDate.message}</p>}
                </div>
                <div>
                  <label className="label">Check-out Date</label>
                  <input
                    type="date"
                    min={checkIn ? minCheckOutDate(checkIn) : minCheckInDate()}
                    className="input-field"
                    {...register('checkOutDate')}
                  />
                  {errors.checkOutDate && <p className="mt-1 text-xs text-red-500">{errors.checkOutDate.message}</p>}
                </div>
                <div>
                  <label className="label">Adults</label>
                  <input
                    type="number"
                    min={1}
                    max={roomData?.capacityAdults || 10}
                    className="input-field"
                    {...register('numAdults', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="label">Children</label>
                  <input
                    type="number"
                    min={0}
                    max={roomData?.capacityChildren || 0}
                    className="input-field"
                    {...register('numChildren', { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Special Requests</h2>
              <textarea
                placeholder="Any special requests? (early check-in, high floor, dietary requirements...)"
                rows={4}
                className="input-field resize-none"
                {...register('specialRequests')}
              />
              <p className="text-xs text-stone-400 mt-1">Requests are not guaranteed but we'll do our best.</p>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Confirm Booking · {formatCurrency(totalPrice + taxes)}
            </Button>
          </form>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h2 className="font-semibold text-stone-900 mb-4">Booking Summary</h2>

            {roomData && (
              <>
                {roomData.photos?.[0] && (
                  <img
                    src={roomData.photos[0].url}
                    alt={roomData.name}
                    className="w-full h-36 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="font-semibold text-stone-900">{roomData.name}</p>
                <p className="text-xs text-stone-400 mb-4">{roomData.type} · Room {roomData.roomNumber}</p>
              </>
            )}

            {nights > 0 && (
              <div className="space-y-2 text-sm border-t border-stone-100 pt-4">
                <div className="flex justify-between text-stone-500">
                  <span>{formatCurrency(roomData?.pricePerNight || 0)} × {nights} nights</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Taxes & fees (12%)</span>
                  <span>{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 border-t border-stone-100 pt-2">
                  <span>Total</span>
                  <span className="text-brand-600">{formatCurrency(totalPrice + taxes)}</span>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-green-50 rounded-lg text-xs text-green-700">
              ✓ Free cancellation up to 24h before check-in
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
