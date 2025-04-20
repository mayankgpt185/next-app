// 'use client';

import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Padhai',
  description: 'CMS',
  icons: {
    icon: './icon.png',
  },
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <html lang="en" data-theme="system" suppressHydrationWarning>
      <head>
        <link rel="icon" href="./icon.png" sizes="any" />
        <link
          rel="icon"
          href="./icon.png"  
          type="image/png"
          sizes="any"
        />
        <link
          rel="apple-touch-icon"
          href="./apple-icon.png"
          type="image/png"
          sizes="any"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              backgroundColor: 'var(--toast-bg)',
              color: 'var(--toast-text)',
            },
            success: {
              style: {
                backgroundColor: 'var(--toast-bg)',
                color: 'var(--toast-text)',
              },
            },
            error: {
              style: {
                backgroundColor: 'var(--toast-bg)',
                color: 'var(--toast-text)',
              },
            },
          }}
        />
      </body>
    </html>
  )
}

export default RootLayout;
