import apiClient from './axiosClient'
import type {
  ApiResponse, AuthResponse, User, Room, Reservation, Review,
  Notification, PageResponse, DashboardStats, RoomSearchParams,
  DateAvailability, AuditLog
} from '@/types'

// ─── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone?: string
  }) => apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  logout: () => apiClient.post<ApiResponse<void>>('/auth/logout'),

  me: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }),
}

// ─── Rooms ──────────────────────────────────────────────────────────────────

export const roomsApi = {
  search: (params: RoomSearchParams) =>
    apiClient.get<ApiResponse<PageResponse<Room>>>('/rooms', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Room>>(`/rooms/${id}`),

  getAvailability: (id: string) =>
    apiClient.get<ApiResponse<{ roomId: string; dates: DateAvailability[] }>>(`/rooms/${id}/availability`),

  create: (data: Partial<Room> & { amenityIds?: number[] }) =>
    apiClient.post<ApiResponse<Room>>('/rooms', data),

  update: (id: string, data: Partial<Room> & { amenityIds?: number[] }) =>
    apiClient.put<ApiResponse<Room>>(`/rooms/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/rooms/${id}`),

  addPhoto: (id: string, url: string) =>
    apiClient.post<ApiResponse<Room>>(`/rooms/${id}/photos`, null, { params: { url } }),

  removePhoto: (roomId: string, photoId: string) =>
    apiClient.delete<ApiResponse<void>>(`/rooms/${roomId}/photos/${photoId}`),
}

// ─── Reservations ────────────────────────────────────────────────────────────

export const reservationsApi = {
  create: (data: {
    roomId: string
    checkInDate: string
    checkOutDate: string
    numAdults: number
    numChildren?: number
    specialRequests?: string
  }) => apiClient.post<ApiResponse<Reservation>>('/reservations', data),

  getAll: (params?: {
    status?: string
    userId?: string
    roomId?: string
    fromDate?: string
    toDate?: string
    page?: number
    size?: number
  }) => apiClient.get<ApiResponse<PageResponse<Reservation>>>('/reservations', { params }),

  getMy: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<Reservation>>>('/reservations/my', {
      params: { page, size }
    }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Reservation>>(`/reservations/${id}`),

  update: (id: string, data: Partial<{
    roomId: string
    checkInDate: string
    checkOutDate: string
    numAdults: number
    numChildren: number
    specialRequests: string
  }>) => apiClient.put<ApiResponse<Reservation>>(`/reservations/${id}`, data),

  updateStatus: (id: string, status: string, note?: string) =>
    apiClient.patch<ApiResponse<Reservation>>(`/reservations/${id}/status`, { status, note }),

  cancel: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/reservations/${id}`),

  getAuditLog: (id: string) =>
    apiClient.get<ApiResponse<AuditLog[]>>(`/reservations/${id}/audit`),
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviewsApi = {
  getRoomReviews: (roomId: string, page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<Review>>>(`/rooms/${roomId}/reviews`, {
      params: { page, size }
    }),

  submit: (roomId: string, data: {
    reservationId: string
    ratingOverall: number
    ratingCleanliness?: number
    ratingComfort?: number
    ratingLocation?: number
    ratingStaff?: number
    comment?: string
    isAnonymous?: boolean
  }) => apiClient.post<ApiResponse<Review>>(`/rooms/${roomId}/reviews`, data),
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Notification>>>('/notifications', {
      params: { page, size }
    }),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<number>>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch<ApiResponse<number>>('/notifications/read-all'),
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboardStats: () =>
    apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats'),

  getUsers: (search?: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<User>>>('/admin/users', {
      params: { search, page, size }
    }),

  updateUserStatus: (userId: string, isActive: boolean) =>
    apiClient.patch<ApiResponse<User>>(`/admin/users/${userId}/status`, { isActive }),

  getPendingReviews: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Review>>>('/admin/reviews/pending', {
      params: { page, size }
    }),

  updateReviewStatus: (reviewId: string, status: string) =>
    apiClient.patch<ApiResponse<Review>>(`/admin/reviews/${reviewId}/status`, { status }),

  deleteReview: (reviewId: string) =>
    apiClient.delete<ApiResponse<void>>(`/admin/reviews/${reviewId}`),
}
