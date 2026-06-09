import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BookingFormClient } from '@/features/booking/BookingFormClient'

export const metadata: Metadata = { title: 'Complete Your Booking' }

export default async function BookingFormPage({ params }: {
  params: Promise<{ roomId: string }>;}) {
  const { roomId } = await params;
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <BookingFormClient roomId={roomId} />
      </main>
      <Footer />
    </div>
  )
}
