import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ConvexClientProvider } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Slick Solutions - AI-Powered Vehicle Inspection",
  description: "Professional vehicle damage assessment and repair estimation powered by artificial intelligence",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">{children}</div>
            <Toaster
              theme="dark"
              className="toaster group"
              toastOptions={{
                classNames: {
                  toast:
                    "group toast group-[.toaster]:bg-slate-800 group-[.toaster]:text-slate-50 group-[.toaster]:border-slate-600 group-[.toaster]:shadow-lg",
                  description: "group-[.toast]:text-slate-400",
                  actionButton: "group-[.toast]:bg-[#00ae98] group-[.toast]:text-slate-50",
                  cancelButton: "group-[.toast]:bg-slate-600 group-[.toast]:text-slate-50",
                },
              }}
            />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
