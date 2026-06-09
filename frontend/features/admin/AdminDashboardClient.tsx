'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api'
import { FullPageSpinner } from '@/components/ui'
import { formatCurrency } from '@/utils/dateHelpers'
import {
  TrendingUp, TrendingDown, BookOpen, BedDouble, Users, DollarSign,
  CalendarCheck, BarChart3
} from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

export function AdminDashboardClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats().then((r) => r.data.data),
    refetchInterval: 60000,
  })

  if (isLoading) return <FullPageSpinner />

  const stats = data!

  const kpiCards = [
    {
      label: 'Bookings Today',
      value: stats.bookingsToday,
      icon: CalendarCheck,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Bookings This Month',
      value: stats.bookingsThisMonth,
      icon: BookOpen,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Revenue This Month',
      value: formatCurrency(stats.revenueThisMonth),
      icon: DollarSign,
      color: 'text-brand-600 bg-brand-50',
      change: stats.revenueChangePercent,
    },
    {
      label: 'Active Rooms',
      value: `${stats.activeRooms} / ${stats.totalRooms}`,
      icon: BedDouble,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-stone-600 bg-stone-100',
    },
    {
      label: 'Occupancy Rate',
      value: `${stats.occupancy.overallOccupancyRate.toFixed(1)}%`,
      icon: BarChart3,
      color: 'text-amber-600 bg-amber-50',
    },
  ]

  // Mock chart data
  const chartData = [
    { month: 'Jan', revenue: 12400, bookings: 42 },
    { month: 'Feb', revenue: 15200, bookings: 51 },
    { month: 'Mar', revenue: 18900, bookings: 63 },
    { month: 'Apr', revenue: 14300, bookings: 48 },
    { month: 'May', revenue: 22100, bookings: 74 },
    { month: 'Jun', revenue: 28700, bookings: 96 },
    { month: 'Jul', revenue: 31200, bookings: 104 },
    { month: 'Aug', revenue: 29500, bookings: 98 },
    { month: 'Sep', revenue: 26800, bookings: 89 },
    { month: 'Oct', revenue: 23400, bookings: 78 },
    { month: 'Nov', revenue: 19800, bookings: 66 },
    { month: 'Dec', revenue: 24600, bookings: 82 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">Overview of your property performance</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-stone-900 mt-1">{card.value}</p>
                {card.change !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-medium mt-1',
                    card.change >= 0 ? 'text-green-600' : 'text-red-500'
                  )}>
                    {card.change >= 0
                      ? <TrendingUp size={12} />
                      : <TrendingDown size={12} />}
                    {Math.abs(card.change).toFixed(1)}% vs last month
                  </div>
                )}
              </div>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', card.color)}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="card p-6">
        <h2 className="font-semibold text-stone-900 mb-6">Revenue Overview (2024)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4892a" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#d4892a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ border: '1px solid #e7e5e4', borderRadius: '8px', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#d4892a"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
