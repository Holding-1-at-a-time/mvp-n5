import "@/app/globals.css"
import type { ReactNode } from "react"
import ConvexClientProvider from "@/app/providers"

export const metadata = {
  title: "Slick Solutions",
  description: "Multi-tenant vehicle-inspection platform",
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
