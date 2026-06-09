'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api'
import { Button, FullPageSpinner, Input } from '@/components/ui'
import { formatDate } from '@/utils/dateHelpers'
import { Users, Search, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'

export function AdminUsersClient() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { search, page }],
    queryFn: () => adminApi.getUsers(search || undefined, page).then(r => r.data.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateUserStatus(id, isActive),
    onSuccess: () => {
      toast.success('User status updated')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  })

  const ROLE_COLORS: Record<string, string> = {
    ADMIN: 'bg-red-50 text-red-700',
    USER: 'bg-blue-50 text-blue-700',
    GUEST: 'bg-stone-100 text-stone-600',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Users</h1>
        <p className="text-stone-400 text-sm mt-1">Manage guest accounts</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="input-field pl-9 text-sm"
          />
        </div>
        {data && <span className="text-sm text-stone-400">{data.totalElements} users</span>}
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {data?.content.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-stone-900">{user.fullName}</div>
                        {user.phone && <div className="text-xs text-stone-400">{user.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn('badge text-xs', ROLE_COLORS[user.role] || 'bg-stone-100 text-stone-600')}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('badge', user.isActive ? 'badge-confirmed' : 'badge-cancelled')}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{formatDate(user.createdAt, 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => updateStatus.mutate({ id: user.id, isActive: !user.isActive })}
                        className={cn(
                          'flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
                          user.isActive
                            ? 'text-red-500 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        )}
                      >
                        {user.isActive ? <><UserX size={12} /> Disable</> : <><UserCheck size={12} /> Enable</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>Previous</Button>
          <span className="text-sm text-stone-500 self-center">{page + 1} / {data.totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={data.last}>Next</Button>
        </div>
      )}
    </div>
  )
}
