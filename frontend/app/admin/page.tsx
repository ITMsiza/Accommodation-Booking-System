import { Metadata } from 'next'
import { AdminDashboardClient } from '@/features/admin/AdminDashboardClient'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default function AdminDashboardPage() {
  return <AdminDashboardClient />
}
