import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ConvexClientProvider } from "@/app/providers"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Slick Solutions - Vehicle Inspection System",
  description: "AI-powered vehicle inspection and damage assessment platform for automotive shops",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ConvexClientProvider>
              <div className="min-h-screen bg-background">{children}</div>
              <Toaster position="top-right" expand={true} richColors={true} closeButton={true} />
            </ConvexClientProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
