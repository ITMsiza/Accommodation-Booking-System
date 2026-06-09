import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { RegisterForm } from '@/features/auth/RegisterForm'

export const metadata: Metadata = { title: 'Create Account' }

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <RegisterForm />
      </div>
    </div>
  )
}
