import { Metadata } from 'next'
import { AdminUsersClient } from '@/features/admin/AdminUsersClient'

export const metadata: Metadata = { title: 'Manage Users' }
export default function AdminUsersPage() { return <AdminUsersClient /> }
