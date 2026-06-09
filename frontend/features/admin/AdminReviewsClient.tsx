'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api'
import { FullPageSpinner, StarRating, StatusBadge } from '@/components/ui'
import { formatDate } from '@/utils/dateHelpers'
import { CheckCircle, EyeOff, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminReviewsClient() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-reviews'],
    queryFn: () => adminApi.getPendingReviews().then(r => r.data.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateReviewStatus(id, status),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'APPROVED' ? 'Review approved' : 'Review hidden')
      qc.invalidateQueries({ queryKey: ['admin-pending-reviews'] })
    },
  })

  const deleteReview = useMutation({
    mutationFn: (id: string) => adminApi.deleteReview(id),
    onSuccess: () => { toast.success('Review deleted'); qc.invalidateQueries({ queryKey: ['admin-pending-reviews'] }) },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Review Moderation</h1>
        <p className="text-stone-400 text-sm mt-1">Approve or hide guest reviews</p>
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : data?.content.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
          <p className="font-semibold text-stone-700">All reviews moderated</p>
          <p className="text-sm text-stone-400">No pending reviews to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.content.map((review) => (
            <div key={review.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-semibold text-stone-900 text-sm">{review.authorName}</div>
                    <StatusBadge status={review.status} />
                    <span className="text-xs text-stone-400">{formatDate(review.createdAt)}</span>
                  </div>
                  <StarRating rating={review.ratingOverall} size={14} showValue />
                  {review.comment && (
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">{review.comment}</p>
                  )}
                  {/* Sub-ratings */}
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-stone-400">
                    {review.ratingCleanliness && <span>Cleanliness: ⭐ {review.ratingCleanliness}</span>}
                    {review.ratingComfort && <span>Comfort: ⭐ {review.ratingComfort}</span>}
                    {review.ratingLocation && <span>Location: ⭐ {review.ratingLocation}</span>}
                    {review.ratingStaff && <span>Staff: ⭐ {review.ratingStaff}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => updateStatus.mutate({ id: review.id, status: 'APPROVED' })}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus.mutate({ id: review.id, status: 'HIDDEN' })}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <EyeOff size={12} /> Hide
                  </button>
                  <button
                    onClick={() => deleteReview.mutate(review.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
