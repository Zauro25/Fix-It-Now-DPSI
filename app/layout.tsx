import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fix It Now - Fasilitas Management',
  description: 'Aplikasi manajemen fasilitas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 ml-16">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}