import "./globals.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { ConvexClientProvider } from "./providers"

export const metadata: Metadata = {
  title: "Slick Solutions – Vehicle Inspection",
  description: "AI-powered platform for vehicle damage assessment and estimating.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  )
}
