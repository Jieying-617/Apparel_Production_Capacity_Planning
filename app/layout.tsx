// app/layout.tsx
import './globals.css'
import Link from 'next/link'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans">
        {/* Global Navigation Header */}
        <header className="bg-indigo-900 text-white shadow">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-lg font-bold">🏭 Apparel Capacity & Bottleneck Planner</h1>
            <nav className="space-x-6 text-sm font-medium">
              <Link href="/capacity" className="hover:text-indigo-300 transition">Step 1: Define Capacity</Link>
              <Link href="/orders" className="hover:text-indigo-300 transition">Step 2: Order Input</Link>
              <Link href="/dashboard" className="hover:text-indigo-300 transition">Step 3: 4-Week Horizon</Link>
            </nav>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="max-w-7xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  )
}