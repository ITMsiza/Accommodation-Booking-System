'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { roomsApi } from '@/api'
import { RoomCard } from './RoomCard'
import { Button, Select, FullPageSpinner, EmptyState } from '@/components/ui'
import { SlidersHorizontal, Search, X, BedDouble } from 'lucide-react'
import type { RoomType } from '@/types'
import { minCheckInDate, minCheckOutDate } from '@/utils/dateHelpers'
import { cn } from '@/utils/cn'

export function RoomListClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [adults, setAdults] = useState(Number(searchParams.get('adults') || 1))
  const [children, setChildren] = useState(Number(searchParams.get('children') || 0))
  const [type, setType] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['rooms', { checkIn, checkOut, adults, children, type, maxPrice, sortBy, page }],
    queryFn: () =>
      roomsApi.search({
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        adults: adults || undefined,
        children: children || undefined,
        type: (type as RoomType) || undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy || undefined,
        page,
        size: 9,
      }).then((r) => r.data.data),
  })

  const clearFilters = () => {
    setCheckIn('')
    setCheckOut('')
    setAdults(1)
    setChildren(0)
    setType('')
    setMaxPrice('')
    setSortBy('name')
    setPage(0)
  }

  const hasFilters = checkIn || checkOut || type || maxPrice || adults > 1 || children > 0

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Available Rooms</h1>
          {data && (
            <p className="text-stone-500 text-sm mt-1">
              {data.totalElements} room{data.totalElements !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn('btn-secondary flex items-center gap-2 text-sm', showFilters && 'bg-brand-50 border-brand-300 text-brand-600')}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-brand-500" />}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="label">Check-in</label>
              <input
                type="date"
                value={checkIn}
                min={minCheckInDate()}
                onChange={(e) => { setCheckIn(e.target.value); setPage(0) }}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label">Check-out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn ? minCheckOutDate(checkIn) : minCheckInDate()}
                onChange={(e) => { setCheckOut(e.target.value); setPage(0) }}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label">Adults</label>
              <input
                type="number"
                value={adults}
                min={1}
                max={10}
                onChange={(e) => { setAdults(Number(e.target.value)); setPage(0) }}
                className="input-field text-sm"
              />
            </div>
            <Select
              label="Room Type"
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(0) }}
              options={[
                { value: '', label: 'All Types' },
                { value: 'SINGLE', label: 'Single' },
                { value: 'DOUBLE', label: 'Double' },
                { value: 'SUITE', label: 'Suite' },
                { value: 'DELUXE', label: 'Deluxe' },
              ]}
            />
            <div>
              <label className="label">Max Price / Night</label>
              <input
                type="number"
                placeholder="Any"
                value={maxPrice}
                min={0}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(0) }}
                className="input-field text-sm"
              />
            </div>
            <Select
              label="Sort By"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(0) }}
              options={[
                { value: 'name', label: 'Name' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Top Rated' },
              ]}
            />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-sm text-stone-400 hover:text-stone-600 flex items-center gap-1">
              <X size={14} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <FullPageSpinner />
      ) : data?.content.length === 0 ? (
        <EmptyState
          icon={<BedDouble size={48} />}
          title="No rooms found"
          description="Try adjusting your search dates or filters."
          action={<Button onClick={clearFilters} variant="outline">Clear Filters</Button>}
        />
      ) : (
        <>
          <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6', isFetching && 'opacity-70')}>
            {data?.content.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                checkIn={checkIn}
                checkOut={checkOut}
                adults={adults}
                children={children}
              />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-stone-500">
                Page {page + 1} of {data.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={data.last}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
