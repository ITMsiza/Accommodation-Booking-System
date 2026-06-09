'use client'

import { cn } from '@/utils/cn'
import { Loader2, Star } from 'lucide-react'
import React from 'react'

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-400',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 focus:ring-stone-300',
    outline: 'bg-transparent border border-brand-300 hover:bg-brand-50 text-brand-600 focus:ring-brand-400',
    ghost: 'bg-transparent hover:bg-stone-100 text-stone-600 hover:text-stone-900',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
  }
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 py-3.5',
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-field',
              leftIcon && 'pl-10',
              error && 'border-red-400 focus:ring-red-400 focus:border-red-400',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'input-field appearance-none cursor-pointer',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 16, md: 24, lg: 36 }
  return (
    <Loader2
      size={sizes[size]}
      className={cn('animate-spin text-brand-500', className)}
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size="lg" />
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: BadgeProps) {
  const map: Record<string, string> = {
    PENDING: 'badge-pending',
    CONFIRMED: 'badge-confirmed',
    CHECKED_IN: 'badge-checked-in',
    CHECKED_OUT: 'badge-checked-out',
    CANCELLED: 'badge-cancelled',
    NO_SHOW: 'badge-no-show',
    APPROVED: 'badge-confirmed',
    HIDDEN: 'badge-checked-out',
  }
  return (
    <span className={cn(map[status] || 'badge bg-stone-100 text-stone-600', className)}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: number
  showValue?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  showValue,
  interactive,
  onChange,
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0)
  const display = hovered || rating

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i + 1)}
          onMouseEnter={() => interactive && setHovered(i + 1)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={cn(!interactive && 'cursor-default')}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors',
              i < Math.round(display) ? 'fill-brand-400 text-brand-400' : 'fill-none text-stone-200'
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="text-sm font-medium text-stone-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-xl shadow-luxury-xl w-full animate-in', widths[size])}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h2 className="font-display font-semibold text-lg text-stone-900">{title}</h2>
            <button onClick={onClose} className="btn-ghost p-1 -mr-1">✕</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-stone-300 mb-4">{icon}</div>}
      <h3 className="font-semibold text-stone-700">{title}</h3>
      {description && <p className="text-sm text-stone-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
