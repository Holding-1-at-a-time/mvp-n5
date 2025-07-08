"use client"

import { RagDashboard } from "@/components/rag-dashboard"
import { useUser } from "@clerk/nextjs"

export default function KnowledgePage() {
  const { user } = useUser()

  // In a real app, you'd get the shopId from user context or route params
  const shopId = (user?.publicMetadata?.shopId as string) || "demo-shop"

  return (
    <div className="container mx-auto py-8">
      <RagDashboard shopId={shopId} />
    </div>
  )
}
