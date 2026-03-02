import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Write-Off | AI Tax Deductions for 1099 Workers',
  description:
    'Stop leaving money on the table. Write-Off uses AI to automatically identify and categorize tax deductions for 1099 workers and freelancers.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0f1e] min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  )
}
