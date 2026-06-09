import { Metadata } from 'next'
import { AdminReviewsClient } from '@/features/admin/AdminReviewsClient'

export const metadata: Metadata = { title: 'Moderate Reviews' }
export default function AdminReviewsPage() { return <AdminReviewsClient /> }
