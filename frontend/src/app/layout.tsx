import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { PreviewProvider } from "@/context/PreviewContext"
import { SocketProvider } from "@/context/SocketContext"
import { ClerkProvider } from "@clerk/nextjs"
import { Analytics } from "@vercel/analytics/react"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import Navbar from '@/components/dashboard/navbar'
import type { Metadata } from "next"
import "./globals.css"
import { Roboto } from 'next/font/google'
import { checkUser } from '@/lib/checkUser'
import { ToastContainer } from 'react-toastify'

const roboto = Roboto({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  title: "CodeMentor",
  description: "Learn to code with AI",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await checkUser()
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <body className="dark:bg-background">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <SocketProvider>
              <PreviewProvider>
              {user && <Navbar userData={user} />}
                {/* Main content without traditional header */}
                <main className="pt-16">{children}</main>
              </PreviewProvider>
            </SocketProvider>
            <Analytics />
            <Toaster position="bottom-left" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}