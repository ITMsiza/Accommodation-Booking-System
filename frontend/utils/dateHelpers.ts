import { format, parseISO, differenceInDays, isAfter, isBefore, addDays } from 'date-fns'

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatDateRange(checkIn: string, checkOut: string) {
  return `${formatDate(checkIn, 'MMM d')} – ${formatDate(checkOut, 'MMM d, yyyy')}`
}

export function nightsBetween(checkIn: string, checkOut: string) {
  return differenceInDays(parseISO(checkOut), parseISO(checkIn))
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatRelativeTime(date: string) {
  const d = parseISO(date)
  const now = new Date()
  const diff = differenceInDays(now, d)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  return formatDate(date)
}

export function toISODate(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export function minCheckInDate() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function minCheckOutDate(checkIn: string) {
  return format(addDays(parseISO(checkIn), 1), 'yyyy-MM-dd')
}
