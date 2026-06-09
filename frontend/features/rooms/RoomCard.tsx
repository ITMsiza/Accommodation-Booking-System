'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Users, Star, ArrowRight } from 'lucide-react'
import type { Room } from '@/types'
import { formatCurrency } from '@/utils/dateHelpers'
import { cn } from '@/utils/cn'

const AMENITY_ICONS: Record<string, string> = {
  wifi: '📶',
  'air-conditioning': '❄️',
  pool: '🏊',
  pet: '🐾',
  parking: '🅿️',
  breakfast: '🍳',
  gym: '💪',
  spa: '🧖',
  'room-service': '🛎️',
  balcony: '🌅',
  'ocean-view': '🌊',
  'mini-bar': '🍸',
  tv: '📺',
  bathtub: '🛁',
  desk: '💼',
}

const TYPE_COLORS: Record<string, string> = {
  SINGLE: 'bg-blue-50 text-blue-700',
  DOUBLE: 'bg-green-50 text-green-700',
  SUITE: 'bg-purple-50 text-purple-700',
  DELUXE: 'bg-brand-50 text-brand-700',
}

interface RoomCardProps {
  room: Room
  checkIn?: string
  checkOut?: string
  adults?: number
  children?: number
  className?: string
}

export function RoomCard({ room, checkIn, checkOut, adults, children: childrenCount, className }: RoomCardProps) {
  const bookParams = new URLSearchParams({
    ...(checkIn && { checkIn }),
    ...(checkOut && { checkOut }),
    ...(adults && { adults: String(adults) }),
    ...(childrenCount && { children: String(childrenCount) }),
  })

  const photoUrl = room.photos?.[0]?.url || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80'

  return (
    <div className={cn('card-hover overflow-hidden group', className)}>
      {/* Photo */}
      <div className="relative h-52 overflow-hidden bg-stone-100">
        <img
          src={photoUrl}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className={cn('badge text-xs font-semibold', TYPE_COLORS[room.type])}>
            {room.type}
          </span>
        </div>
        {room.averageRating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <Star size={12} className="fill-brand-400 text-brand-400" />
            <span className="text-xs font-semibold text-stone-800">{room.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-stone-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {room.name}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Room {room.roomNumber} · Floor {room.floor}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-stone-900">{formatCurrency(room.pricePerNight)}</p>
            <p className="text-xs text-stone-400">/ night</p>
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1 text-xs text-stone-500 mb-3">
          <Users size={12} />
          <span>Up to {room.capacityAdults} adults</span>
          {room.capacityChildren > 0 && <span>· {room.capacityChildren} children</span>}
          {room.reviewCount > 0 && (
            <>
              <span className="text-stone-200">·</span>
              <span>{room.reviewCount} reviews</span>
            </>
          )}
        </div>

        {/* Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {room.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-50 border border-stone-100 rounded-md text-xs text-stone-500"
                title={amenity.name}
              >
                {AMENITY_ICONS[amenity.iconKey] || '✓'} {amenity.name}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded-md text-xs text-stone-400">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/rooms/${room.id}?${bookParams}`}
            className="flex-1 btn-secondary text-sm py-2 justify-center"
          >
            View Details
          </Link>
          <Link
            href={`/book/${room.id}?${bookParams}`}
            className="flex-1 btn-primary text-sm py-2 justify-center"
          >
            Book Now <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
