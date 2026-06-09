import { Metadata } from 'next'
import { AdminRoomsClient } from '@/features/admin/AdminRoomsClient'

export const metadata: Metadata = { title: 'Manage Rooms' }
export default function AdminRoomsPage() { return <AdminRoomsClient /> }
