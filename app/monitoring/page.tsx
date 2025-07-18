import { OllamaMonitoringDashboard } from "@/components/ollama-monitoring-dashboard"

export const dynamic = "force-dynamic"

export default function MonitoringPage() {
  return (
    <div className="container mx-auto py-8">
      <OllamaMonitoringDashboard />
    </div>
  )
}
