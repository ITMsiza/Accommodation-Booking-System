'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roomsApi } from '@/api'
import { Button, Modal, Input, Select, FullPageSpinner, StatusBadge } from '@/components/ui'
import { formatCurrency } from '@/utils/dateHelpers'
import { Plus, Pencil, Trash2, BedDouble } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import type { Room } from '@/types'

export function AdminRoomsClient() {
  const qc = useQueryClient()
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-rooms', page],
    queryFn: () => roomsApi.search({ page, size: 15 }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onSuccess: () => { toast.success('Room deactivated'); qc.invalidateQueries({ queryKey: ['admin-rooms'] }) },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Rooms</h1>
          <p className="text-stone-400 text-sm mt-1">Manage your room catalogue</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus size={16} /> Add Room
        </Button>
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['#', 'Room', 'Type', 'Floor', 'Capacity', 'Price/Night', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {data?.content.map((room) => (
                <tr key={room.id} className="hover:bg-stone-50/50">
                  <td className="px-4 py-3 font-mono text-stone-500">{room.roomNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-900">{room.name}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{room.type}</td>
                  <td className="px-4 py-3 text-stone-600">{room.floor}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {room.capacityAdults}A / {room.capacityChildren}C
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-800">
                    {formatCurrency(room.pricePerNight)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${room.isActive ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditRoom(room)}
                        className="p-1.5 text-stone-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(room.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
          <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={data?.last}>Next</Button>
        </div>
      )}

      <RoomFormModal
        isOpen={createOpen || !!editRoom}
        onClose={() => { setCreateOpen(false); setEditRoom(null) }}
        room={editRoom}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['admin-rooms'] })
          setCreateOpen(false)
          setEditRoom(null)
        }}
      />
    </div>
  )
}

function RoomFormModal({ isOpen, onClose, room, onSuccess }: {
  isOpen: boolean; onClose: () => void; room: Room | null; onSuccess: () => void
}) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: room ? {
      name: room.name, roomNumber: room.roomNumber, type: room.type,
      floor: String(room.floor), capacityAdults: String(room.capacityAdults),
      capacityChildren: String(room.capacityChildren), pricePerNight: String(room.pricePerNight),
      description: room.description || '',
    } : {}
  })

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        floor: Number(data.floor),
        capacityAdults: Number(data.capacityAdults),
        capacityChildren: Number(data.capacityChildren),
        pricePerNight: Number(data.pricePerNight),
      }
      if (room) {
        await roomsApi.update(room.id, payload)
        toast.success('Room updated')
      } else {
        await roomsApi.create(payload)
        toast.success('Room created')
      }
      onSuccess()
      reset()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? 'Edit Room' : 'Add New Room'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Room Number" placeholder="101" {...register('roomNumber', { required: true })} />
          <Input label="Name" placeholder="Ocean Breeze Suite" {...register('name', { required: true })} />
          <Select
            label="Type"
            options={[
              { value: 'SINGLE', label: 'Single' },
              { value: 'DOUBLE', label: 'Double' },
              { value: 'SUITE', label: 'Suite' },
              { value: 'DELUXE', label: 'Deluxe' },
            ]}
            {...register('type', { required: true })}
          />
          <Input label="Floor" type="number" min={1} {...register('floor', { required: true })} />
          <Input label="Adults Capacity" type="number" min={1} max={10} {...register('capacityAdults', { required: true })} />
          <Input label="Children Capacity" type="number" min={0} max={10} {...register('capacityChildren')} />
          <Input label="Price Per Night ($)" type="number" step="0.01" min={1} {...register('pricePerNight', { required: true })} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea rows={3} className="input-field resize-none" placeholder="Room description..." {...register('description')} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={isSubmitting} className="flex-1">
            {room ? 'Update Room' : 'Create Room'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
