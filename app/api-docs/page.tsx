"use client"

import dynamic from "next/dynamic"

/**
 * Load the docs component only on the client to avoid
 * server-side variable leaks during static generation.
 */
const OllamaApiDocs = dynamic(() => import("@/components/ollama-api-docs").then((m) => m.OllamaApiDocs ?? m.default), {
  ssr: false,
  loading: () => <p className="text-center py-12 text-muted-foreground">Loading documentation…</p>,
})

export default function ApiDocsPage() {
  return (
    <main className="container mx-auto py-8">
      <OllamaApiDocs />
    </main>
  )
}
