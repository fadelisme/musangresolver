import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Musang Resolver',
  description: 'Resolve redirect URLs and export to CSV',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
