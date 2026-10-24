import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import FloatingButtons from '@/components/FloatingButtons'

export const metadata: Metadata = {
  title: 'Thenam Software Solutions | Technology That Moves Your Business Forward',
  description:
    'We build websites, AI-powered applications, and custom software that solve real business problems. Chennai, Tamil Nadu, India.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/thenam-leaf-favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-dark-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: '#050B14',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('thenam-theme');
                  if (stored === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <FloatingButtons />
        <Analytics />
      </body>
    </html>
  )
}

