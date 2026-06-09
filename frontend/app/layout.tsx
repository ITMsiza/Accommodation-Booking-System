import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | StayEase',
    default: 'StayEase — Hotel & Accommodation Booking',
  },
  description: 'Find and book the perfect hotel room. Real-time availability, instant confirmation.',
  keywords: ['hotel booking', 'accommodation', 'travel', 'rooms'],
  openGraph: {
    title: 'StayEase',
    description: 'Hotel & Accommodation Booking System',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-stone-50 text-stone-900 antialiased">
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1c1917',
              color: '#fafaf9',
              borderRadius: '8px',
              border: '1px solid #44403c',
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#d4892a', secondary: '#fafaf9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fafaf9' },
            },
          }}
        />
      </body>
    </html>
  )
}
