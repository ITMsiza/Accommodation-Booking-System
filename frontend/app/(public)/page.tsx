import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HomeHero } from '@/features/rooms/HomeHero'
import { FeaturedRooms } from '@/features/rooms/FeaturedRooms'
import { WhyStayEase } from '@/features/rooms/FeaturedRooms'

export const metadata: Metadata = {
  title: 'StayEase — Hotel & Accommodation Booking',
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HomeHero />
        <FeaturedRooms />
        <WhyStayEase />
      </main>
      <Footer />
    </div>
  )
}
