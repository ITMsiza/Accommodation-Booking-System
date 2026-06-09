'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui'
import { minCheckInDate, minCheckOutDate } from '@/utils/dateHelpers'

export function HomeHero() {
  const router = useRouter()
  const today = minCheckInDate()
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(minCheckOutDate(today))
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const handleSearch = () => {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: String(adults),
      ...(children > 0 && { children: String(children) }),
    })
    router.push(`/rooms?${params}`)
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-brand-950" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative page-container py-24 lg:py-36">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 border border-brand-500/30 text-brand-300 rounded-full text-sm font-medium mb-6">
            ✦ Premium Accommodations
          </span>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4">
            Find Your Perfect
            <br />
            <span className="text-brand-400">Place to Stay</span>
          </h1>
          <p className="text-lg text-stone-300 mb-10 max-w-xl">
            Discover handpicked rooms with real-time availability.
            Book instantly, modify freely, arrive confidently.
          </p>

          {/* Search bar */}
          <div className="bg-white rounded-2xl p-2 shadow-luxury-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
              <div className="p-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
                  <Calendar size={12} />
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    setCheckIn(e.target.value)
                    if (e.target.value >= checkOut) {
                      setCheckOut(minCheckOutDate(e.target.value))
                    }
                  }}
                  className="w-full text-sm font-medium text-stone-900 focus:outline-none bg-transparent"
                />
              </div>

              <div className="p-3 border-l border-stone-100">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
                  <Calendar size={12} />
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={minCheckOutDate(checkIn)}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-sm font-medium text-stone-900 focus:outline-none bg-transparent"
                />
              </div>

              <div className="p-3 border-l border-stone-100">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
                  <Users size={12} />
                  Guests
                </label>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-stone-500">Adults:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-5 h-5 rounded-full border border-stone-200 text-stone-600 hover:border-brand-400 hover:text-brand-600 flex items-center justify-center text-xs"
                    >
                      −
                    </button>
                    <span className="font-semibold text-stone-900 w-4 text-center">{adults}</span>
                    <button
                      onClick={() => setAdults(Math.min(10, adults + 1))}
                      className="w-5 h-5 rounded-full border border-stone-200 text-stone-600 hover:border-brand-400 hover:text-brand-600 flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm mt-1">
                  <span className="text-stone-500">Kids:</span>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-5 h-5 rounded-full border border-stone-200 text-stone-600 hover:border-brand-400 hover:text-brand-600 flex items-center justify-center text-xs"
                    >
                      −
                    </button>
                    <span className="font-semibold text-stone-900 w-4 text-center">{children}</span>
                    <button
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      className="w-5 h-5 rounded-full border border-stone-200 text-stone-600 hover:border-brand-400 hover:text-brand-600 flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="w-full h-full rounded-xl"
                >
                  <Search size={18} />
                  Search
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-4">
            Free cancellation up to 24 hours before check-in on most rooms
          </p>
        </div>
      </div>
    </section>
  )
}
