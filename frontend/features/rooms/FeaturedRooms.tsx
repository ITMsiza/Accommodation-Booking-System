'use client'

import { useQuery } from '@tanstack/react-query'
import { roomsApi } from '@/api'
import { RoomCard } from './RoomCard'
import { FullPageSpinner } from '@/components/ui'
import Link from 'next/link'
import { ArrowRight, Shield, Clock, Star, Headphones } from 'lucide-react'

export function FeaturedRooms() {
  const { data, isLoading } = useQuery({
    queryKey: ['rooms', 'featured'],
    queryFn: () => roomsApi.search({ size: 4, sortBy: 'rating' }).then((r) => r.data.data),
  })

  return (
    <section className="py-20 page-container">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="section-title">Featured Rooms</h2>
          <p className="section-subtitle">Handpicked accommodations our guests love</p>
        </div>
        <Link href="/rooms" className="btn-outline text-sm hidden sm:flex">
          View all <ArrowRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.content.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8 sm:hidden">
        <Link href="/rooms" className="btn-outline">
          View all rooms <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

export function WhyStayEase() {
  const features = [
    {
      icon: <Shield size={24} />,
      title: 'Secure Booking',
      desc: 'Your data is protected with industry-standard encryption and JWT authentication.',
    },
    {
      icon: <Clock size={24} />,
      title: 'Instant Confirmation',
      desc: 'Get real-time booking confirmation with immediate status updates.',
    },
    {
      icon: <Star size={24} />,
      title: 'Verified Reviews',
      desc: 'All reviews are from guests who have actually completed their stay.',
    },
    {
      icon: <Headphones size={24} />,
      title: '24/7 Support',
      desc: 'Our team is always available to help you before, during, and after your stay.',
    },
  ]

  return (
    <section className="bg-stone-900 py-20">
      <div className="page-container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-white mb-3">Why Choose StayEase?</h2>
          <p className="text-stone-400 max-w-lg mx-auto">
            We make hotel booking simple, transparent, and reliable.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-stone-800 hover:border-brand-700 transition-colors">
              <div className="w-10 h-10 bg-brand-500/10 text-brand-400 rounded-lg flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
