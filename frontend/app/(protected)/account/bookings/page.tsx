import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MyBookingsClient } from '@/features/booking/MyBookingsClient'

export const metadata: Metadata = { title: 'My Bookings' }

export default function MyBookingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <MyBookingsClient />
      </main>
      <Footer />
    </div>
  )
}
