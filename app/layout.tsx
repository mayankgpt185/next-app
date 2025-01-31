import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="winter">
      {/* <NextThemeProvider attribute="class" defaultTheme="dark"> */}
        <body className={inter.className}>{children}
          {/* <main>{children}</main> */}
          {/* <Sidebar /> */}
        </body>
      {/* </NextThemeProvider> */}
    </html>
  )
}
