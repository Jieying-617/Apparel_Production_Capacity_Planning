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
      <body className="bg-white text-black font-sans min-h-screen">
        {/* Navigation Header */}
        <header className="bg-indigo-900 text-white shadow">
          <div className="w-[80%] mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-lg font-bold">Apparel Capacity & Bottleneck Planner</h1>
            <nav className="space-x-8 text-sm font-medium">
              <Link href="/capacity" className="hover:text-indigo-300 transition">Capacity</Link>
              <Link href="/orders" className="hover:text-indigo-300 transition">Order Input</Link>
              <Link href="/dashboard" className="hover:text-indigo-300 transition">4-Week Horizon</Link>
              <Link href="/settings" className="hover:text-indigo-300 transition">Settings</Link>
            </nav>
          </div>
        </header>

        {/* Main Content Container occupying 80% width */}
        <main className="w-[80%] mx-auto py-8">
          {children}
        </main>
      </body>
    </html>
  )
}