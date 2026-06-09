import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">S</span>
              </div>
              <span className="font-display font-bold text-xl text-white">StayEase</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Find your perfect stay. Real-time availability, instant booking,
              and exceptional experiences at every destination.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-stone-300 mb-3 text-sm uppercase tracking-wide">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rooms" className="hover:text-white transition-colors">Browse Rooms</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-stone-300 mb-3 text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 mt-8 pt-8 text-xs text-stone-500">
          © {new Date().getFullYear()} StayEase. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
