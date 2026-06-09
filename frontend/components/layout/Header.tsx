'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authApi, notificationsApi } from '@/api'
import { Bell, Menu, X, User, LogOut, Settings, BookOpen, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/utils/cn'

export function Header() {
  const { user, clearAuth } = useAuthStore()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const { data: unreadCount } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => {
    console.log("TOKEN:", localStorage.getItem("accessToken"))

    return notificationsApi
      .getUnreadCount()
      .then((r) => r.data.data)
  },
    enabled: !!user && typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
    refetchInterval: 30000,
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications-preview'],
    queryFn: () => notificationsApi.getAll(0, 5).then((r) => r.data.data),
    enabled: !!user && notifOpen,
  })

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      clearAuth()
      toast.success('Logged out')
      window.location.href = '/'
    }
  }

  const isAdmin = user?.role === 'ADMIN'

  const navLinks = [
    { href: '/rooms', label: 'Browse Rooms' },
    ...(user ? [{ href: '/account/bookings', label: 'My Bookings' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">S</span>
            </div>
            <span className="font-display font-bold text-xl text-stone-900">StayEase</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Notification bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="btn-ghost relative"
                  >
                    <Bell size={20} />
                    {unreadCount && unreadCount > 0 ? (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    ) : null}
                  </button>

                  {/* Notifications dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 card shadow-luxury-lg animate-in z-50">
                      <div className="p-4 border-b border-stone-100">
                        <h3 className="font-semibold text-stone-900">Notifications</h3>
                      </div>
                      <div className="divide-y divide-stone-50 max-h-72 overflow-y-auto scrollbar-thin">
                        {notifData?.content.length === 0 ? (
                          <p className="p-4 text-sm text-stone-400 text-center">No notifications</p>
                        ) : (
                          notifData?.content.map((n) => (
                            <div
                              key={n.id}
                              className={cn(
                                'p-4 hover:bg-stone-50 transition-colors',
                                !n.isRead && 'bg-brand-50/30'
                              )}
                            >
                              <div className="flex items-start gap-2">
                                {!n.isRead && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                                )}
                                <div className={!n.isRead ? '' : 'pl-3.5'}>
                                  <p className="text-sm font-medium text-stone-900">{n.title}</p>
                                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.body}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 border-t border-stone-100">
                        <Link
                          href="/account/notifications"
                          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                          onClick={() => setNotifOpen(false)}
                        >
                          View all
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-brand-700 text-sm font-semibold">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-stone-700">
                      {user.firstName}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 card shadow-luxury-lg animate-in z-50">
                      <div className="p-3 border-b border-stone-100">
                        <p className="text-sm font-semibold text-stone-900">{user.fullName}</p>
                        <p className="text-xs text-stone-400">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-md"
                        >
                          <User size={16} />
                          My Account
                        </Link>
                        <Link
                          href="/account/bookings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-md"
                        >
                          <BookOpen size={16} />
                          My Bookings
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 rounded-md"
                          >
                            <Shield size={16} />
                            Admin Panel
                          </Link>
                        )}
                        <div className="divider my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <LogOut size={16} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden btn-ghost"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-stone-100 animate-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {(userMenuOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false)
            setNotifOpen(false)
          }}
        />
      )}
    </header>
  )
}
