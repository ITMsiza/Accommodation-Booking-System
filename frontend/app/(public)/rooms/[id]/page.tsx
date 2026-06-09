import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { RoomDetailClient } from '@/features/rooms/RoomDetailClient'

export const metadata: Metadata = { title: 'Room Details' }

export default async function RoomDetailPage({params,}: { params:{ id: string }}) 
{
  const { id } = await params
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <RoomDetailClient roomId={id} />
      </main>
      <Footer />
    </div>
  )
}
