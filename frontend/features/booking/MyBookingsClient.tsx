'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { reservationsApi } from '@/api'
import { StatusBadge, FullPageSpinner, EmptyState, Button, Modal } from '@/components/ui'
import { formatDate, formatCurrency } from '@/utils/dateHelpers'
import { BookOpen, Calendar, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Reservation } from '@/types'

export function MyBookingsClient() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [cancelModal, setCancelModal] = useState<Reservation | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-reservations', page],
    queryFn: () => reservationsApi.getMy(page).then((r) => r.data.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      toast.success('Reservation cancelled')
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] })
      setCancelModal(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Cancellation failed')
    },
  })

  const canCancel = (r: Reservation) =>
    r.status === 'PENDING' || r.status === 'CONFIRMED'

  return (
    <div className="page-container max-w-4xl">
      <h1 className="section-title mb-2">My Bookings</h1>
      <p className="text-stone-400 mb-8">Manage your reservations</p>

      {isLoading ? (
        <FullPageSpinner />
      ) : data?.content.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No bookings yet"
          description="Browse our rooms and make your first booking."
          action={<Link href="/rooms" className="btn-primary">Browse Rooms</Link>}
        />
      ) : (
        <>
          <div className="space-y-4">
            {data?.content.map((res) => (
              <div key={res.id} className="card p-5 hover:shadow-luxury-lg transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Room photo */}
                  {res.room.photos?.[0] && (
                    <img
                      src={res.room.photos[0].url}
                      alt={res.room.name}
                      className="w-full sm:w-24 h-24 object-cover rounded-lg shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-stone-900">{res.room.name}</h3>
                        <p className="text-xs text-stone-400">
                          Ref: #{res.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <StatusBadge status={res.status} />
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-stone-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-stone-400" />
                        {formatDate(res.checkInDate, 'MMM d')} – {formatDate(res.checkOutDate, 'MMM d, yyyy')}
                      </span>
                      <span>{res.nights} nights</span>
                      <span>{res.numAdults} adults{res.numChildren > 0 ? `, ${res.numChildren} children` : ''}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold text-brand-600">{formatCurrency(res.totalPrice)}</span>
                      <div className="flex gap-2">
                        <Link
                          href={`/account/bookings/${res.id}`}
                          className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-2"
                        >
                          View Details
                        </Link>
                        {canCancel(res) && (
                          <button
                            onClick={() => setCancelModal(res)}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                Previous
              </Button>
              <span className="text-sm text-stone-500 self-center">
                {page + 1} / {data.totalPages}
              </span>
              <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={data.last}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Cancel modal */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Reservation"
        size="sm"
      >
        <p className="text-stone-600 text-sm mb-4">
          Are you sure you want to cancel your booking for{' '}
          <strong>{cancelModal?.room.name}</strong>?
        </p>
        {cancelModal && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700">
            ⚠️ Cancellations within 24 hours of check-in incur a 1-night cancellation fee.
          </div>
        )}
        <div className="flex gap-3">
          <Button
            variant="danger"
            className="flex-1"
            loading={cancelMutation.isPending}
            onClick={() => cancelModal && cancelMutation.mutate(cancelModal.id)}
          >
            Yes, Cancel
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setCancelModal(null)}>
            Keep Booking
          </Button>
        </div>
      </Modal>
    </div>
  )
}
