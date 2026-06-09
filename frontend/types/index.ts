// types/index.ts
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string
  role: 'GUEST' | 'USER' | 'ADMIN'
  isActive: boolean
  notifyEmail: boolean
  notifyPush: boolean
  createdAt: string
}

export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE'

export interface Amenity {
  id: number
  name: string
  iconKey: string
}

export interface RoomPhoto {
  id: string
  url: string
  displayOrder: number
}

export interface Room {
  id: string
  roomNumber: string
  name: string
  type: RoomType
  floor: number
  capacityAdults: number
  capacityChildren: number
  pricePerNight: number
  description?: string
  isActive: boolean
  amenities: Amenity[]
  photos: RoomPhoto[]
  averageRating?: number
  reviewCount: number
  createdAt: string
}

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW'

export interface Reservation {
  id: string
  user: User
  room: Room
  checkInDate: string
  checkOutDate: string
  numAdults: number
  numChildren: number
  status: ReservationStatus
  totalPrice: number
  cancellationFee?: number
  specialRequests?: string
  nights: number
  createdAt: string
  updatedAt: string
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'HIDDEN'

export interface Review {
  id: string
  authorName: string
  userId?: string
  roomId: string
  ratingOverall: number
  ratingCleanliness?: number
  ratingComfort?: number
  ratingLocation?: number
  ratingStaff?: number
  comment?: string
  isAnonymous: boolean
  status: ReviewStatus
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  reservationId?: string
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
  timestamp: string
}

export interface ApiError {
  error: string
  details?: string[]
  timestamp: string
}

export interface DashboardStats {
  bookingsToday: number
  bookingsThisMonth: number
  revenueThisMonth: number
  revenuePrevMonth: number
  revenueChangePercent: number
  totalRooms: number
  activeRooms: number
  totalUsers: number
  occupancy: {
    overallOccupancyRate: number
    byRoomType: Array<{ roomType: string; occupancyRate: number }>
  }
}

export interface DateAvailability {
  date: string
  status: 'AVAILABLE' | 'BOOKED'
}

export interface AuditLog {
  id: number
  oldStatus?: string
  newStatus: string
  changedBy: string
  note?: string
  changedAt: string
}

// Form types
export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface BookingFormData {
  roomId: string
  checkInDate: string
  checkOutDate: string
  numAdults: number
  numChildren: number
  specialRequests?: string
}

export interface RoomSearchParams {
  checkIn?: string
  checkOut?: string
  adults?: number
  children?: number
  type?: RoomType
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  page?: number
  size?: number
}
