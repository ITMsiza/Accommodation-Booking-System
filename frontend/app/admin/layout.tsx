import { Header } from '@/components/layout/Header'
import { AdminSidebar } from '@/features/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-stone-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
