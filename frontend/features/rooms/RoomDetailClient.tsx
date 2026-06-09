'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { roomsApi, reviewsApi } from '@/api'
import { FullPageSpinner, StarRating, StatusBadge, Button } from '@/components/ui'
import { Users, MapPin, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { formatCurrency, formatDate, nightsBetween } from '@/utils/dateHelpers'
import { cn } from '@/utils/cn'

const AMENITY_ICONS: Record<string, string> = {
  wifi: '📶', 'air-conditioning': '❄️', pool: '🏊', pet: '🐾',
  parking: '🅿️', breakfast: '🍳', gym: '💪', spa: '🧖',
  'room-service': '🛎️', balcony: '🌅', 'ocean-view': '🌊',
  'mini-bar': '🍸', tv: '📺', bathtub: '🛁', desk: '💼',
}

export function RoomDetailClient({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams()
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const adults = searchParams.get('adults') || '1'
  const children = searchParams.get('children') || '0'
  const [photoIdx, setPhotoIdx] = useState(0)

  const { data: roomData, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomsApi.getById(roomId).then((r) => r.data.data),
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', roomId],
    queryFn: () => reviewsApi.getRoomReviews(roomId).then((r) => r.data.data),
  })

  if (isLoading) return <FullPageSpinner />
  if (!roomData) return null

  const room = roomData
  const photos = room.photos?.length > 0 ? room.photos : [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', id: '1', displayOrder: 0 }]
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : null

  const bookParams = new URLSearchParams({
    ...(checkIn && { checkIn }),
    ...(checkOut && { checkOut }),
    adults,
    ...(Number(children) > 0 && { children }),
  })

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-stone-400 mb-6">
        <Link href="/rooms" className="hover:text-stone-600">Rooms</Link>
        <span>/</span>
        <span className="text-stone-700">{room.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photo gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-[16/9]">
            <img
              src={photos[photoIdx]?.url}
              alt={room.name}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIdx((p) => (p - 1 + photos.length) % photos.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setPhotoIdx((p) => (p + 1) % photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPhotoIdx(i)}
                      className={cn('w-2 h-2 rounded-full transition-colors', i === photoIdx ? 'bg-white' : 'bg-white/50')}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setPhotoIdx(i)}
                  className={cn('shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                    i === photoIdx ? 'border-brand-500' : 'border-transparent')}
                >
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Room info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="font-display text-3xl font-bold text-stone-900">{room.name}</h1>
                <p className="text-stone-400 mt-1">Room {room.roomNumber} · Floor {room.floor} · {room.type}</p>
              </div>
              {room.averageRating && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <StarRating rating={room.averageRating} size={18} />
                  <span className="font-semibold text-stone-700">{room.averageRating.toFixed(1)}</span>
                  <span className="text-stone-400 text-sm">({room.reviewCount})</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
              <span className="flex items-center gap-1.5">
                <Users size={16} />
                Up to {room.capacityAdults} adults{room.capacityChildren > 0 ? `, ${room.capacityChildren} children` : ''}
              </span>
            </div>

            {room.description && (
              <p className="text-stone-600 leading-relaxed">{room.description}</p>
            )}
          </div>

          {/* Amenities */}
          {room.amenities?.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-stone-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.amenities.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg text-sm text-stone-700">
                    <span className="text-lg">{AMENITY_ICONS[a.iconKey] || '✓'}</span>
                    {a.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900 mb-4">
              Guest Reviews
              {reviewsData && reviewsData.totalElements > 0 && (
                <span className="text-sm font-normal text-stone-400 ml-2">({reviewsData.totalElements})</span>
              )}
            </h2>
            {reviewsData?.content.length === 0 ? (
              <p className="text-stone-400 text-sm py-4">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviewsData?.content.map((review) => (
                  <div key={review.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-medium text-stone-900 text-sm">{review.authorName}</p>
                        <p className="text-xs text-stone-400">{formatDate(review.createdAt)}</p>
                      </div>
                      <StarRating rating={review.ratingOverall} size={14} />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-stone-600 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-3xl font-bold text-stone-900">
                {formatCurrency(room.pricePerNight)}
              </span>
              <span className="text-stone-400 text-sm">/ night</span>
            </div>

            {checkIn && checkOut && nights && (
              <div className="bg-stone-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Check-in</span>
                  <span className="font-medium">{formatDate(checkIn, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Check-out</span>
                  <span className="font-medium">{formatDate(checkOut, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Duration</span>
                  <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-brand-600">{formatCurrency(room.pricePerNight * nights)}</span>
                </div>
              </div>
            )}

            <Link href={`/book/${room.id}?${bookParams}`} className="w-full">
              <Button className="w-full" size="lg">
                Book This Room
              </Button>
            </Link>

            <p className="text-xs text-stone-400 text-center mt-3">
              Free cancellation up to 24h before check-in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
