import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RoomListClient } from '@/features/rooms/RoomListClient'

export const metadata: Metadata = { title: 'Browse Rooms' }

export default function RoomsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <RoomListClient />
      </main>
      <Footer />
    </div>
  )
}
