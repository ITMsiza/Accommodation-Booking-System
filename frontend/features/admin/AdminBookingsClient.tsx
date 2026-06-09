'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reservationsApi } from '@/api'
import { StatusBadge, Button, Select, FullPageSpinner, EmptyState } from '@/components/ui'
import { formatDate, formatCurrency } from '@/utils/dateHelpers'
import { BookOpen, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Reservation } from '@/types'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CHECKED_IN', label: 'Checked In' },
  { value: 'CHECKED_OUT', label: 'Checked Out' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
]

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW'],
  CHECKED_IN: ['CHECKED_OUT'],
  CHECKED_OUT: [],
  CANCELLED: [],
  NO_SHOW: [],
}

export function AdminBookingsClient() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reservations', { status, page }],
    queryFn: () => reservationsApi.getAll({ status: status || undefined, page, size: 15 }).then(r => r.data.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      reservationsApi.updateStatus(id, newStatus),
    onSuccess: () => {
      toast.success('Status updated')
      qc.invalidateQueries({ queryKey: ['admin-reservations'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Bookings</h1>
        <p className="text-stone-400 text-sm mt-1">Manage all reservations</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="w-48">
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0) }}
            options={STATUS_OPTIONS}
          />
        </div>
        {data && (
          <span className="text-sm text-stone-400">{data.totalElements} total</span>
        )}
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : data?.content.length === 0 ? (
        <EmptyState icon={<BookOpen size={48} />} title="No bookings found" />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  {['Ref', 'Guest', 'Room', 'Dates', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {data?.content.map((res) => (
                  <tr key={res.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-stone-400">
                      {res.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-900">{res.user.fullName}</div>
                      <div className="text-xs text-stone-400">{res.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-700">{res.room.name}</div>
                      <div className="text-xs text-stone-400">{res.room.type}</div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {formatDate(res.checkInDate, 'MMM d')} → {formatDate(res.checkOutDate, 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {formatCurrency(res.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={res.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {NEXT_STATUSES[res.status]?.map((nextStatus) => (
                          <button
                            key={nextStatus}
                            onClick={() => updateStatus.mutate({ id: res.id, newStatus: nextStatus })}
                            className="text-xs px-2 py-1 bg-stone-100 hover:bg-brand-50 hover:text-brand-700 rounded transition-colors"
                          >
                            → {nextStatus.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                Previous
              </Button>
              <span className="text-sm text-stone-500 self-center">{page + 1} / {data.totalPages}</span>
              <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={data.last}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
