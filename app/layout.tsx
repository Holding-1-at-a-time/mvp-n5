import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ConvexClientProvider } from "@/app/providers"
import { ErrorBoundary } from "@/components/error-boundary"
import { ErrorLogger } from "@/lib/error-handling"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Slick Solutions - Vehicle Inspection System",
  description: "AI-powered vehicle inspection and damage assessment platform for automotive shops",
    generator: 'v0.dev'
}

// Global error handler for client-side errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    ErrorLogger.log(event.error, {
      context: "global_error_handler",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })

  window.addEventListener("unhandledrejection", (event) => {
    ErrorLogger.log(new Error(event.reason), {
      context: "unhandled_promise_rejection",
    })
  })
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ErrorBoundary
            onError={(error, errorInfo) => {
              ErrorLogger.log(error, {
                context: "root_error_boundary",
                componentStack: errorInfo.componentStack,
              })
            }}
          >
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <ConvexClientProvider>
                <div className="min-h-screen bg-background">{children}</div>
                <Toaster position="top-right" expand={true} richColors={true} closeButton={true} />
              </ConvexClientProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  )
}
