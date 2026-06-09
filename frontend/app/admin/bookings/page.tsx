import { Metadata } from 'next'
import { AdminBookingsClient } from '@/features/admin/AdminBookingsClient'

export const metadata: Metadata = { title: 'Manage Bookings' }
export default function AdminBookingsPage() { return <AdminBookingsClient /> }
