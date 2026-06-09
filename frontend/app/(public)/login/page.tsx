import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/features/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <LoginForm />
      </div>
    </div>
  )
}
