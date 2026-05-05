import type { Metadata } from 'next'
import { Inter, Geist_Mono, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClientLayout } from '@/components/app-shell/client-layout'
import { getAuthState } from '@/lib/auth'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', display: 'swap' })

export const metadata: Metadata = {
  title: 'SubNiche - Your Gear Community',
  description: 'The social marketplace for hobby enthusiasts. Buy, sell, and trade gear with your community.',
  generator: 'SubNiche',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const authState = getAuthState()
  const isAuthenticated = authState !== 'logged-out'

  return (
    <html
      lang="en"
      className={`dark bg-background ${inter.variable} ${geistMono.variable} ${sourceSerif.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <ClientLayout isAuthenticated={isAuthenticated}>{children}</ClientLayout>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
