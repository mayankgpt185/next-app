'use client';

import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="system" suppressHydrationWarning>
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
