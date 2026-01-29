import type { Metadata } from 'next'
import './globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import MainLayout from '@/components/MainLayout'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Trading Bot System',
  description: 'Manage your automated trading bots',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-neutral-50`}>
        {/* ใช้ MainLayout ควบคุมการแสดงผลตามเงื่อนไข pathname */}
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  )
}