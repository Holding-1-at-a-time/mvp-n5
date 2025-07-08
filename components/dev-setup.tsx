"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check, AlertCircle, CheckCircle } from "lucide-react"
import { env, isDev } from "@/lib/env"

export function DevSetup() {
  const [copied, setCopied] = useState(false)

  // Only show in development
  if (!isDev) return null

  const hasConvexUrl = !!env.NEXT_PUBLIC_CONVEX_URL

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const setupSteps = [
    {
      id: 1,
      title: "Install Convex CLI",
      command: "npm install -g convex",
      description: "Install the Convex command line interface",
    },
    {
      id: 2,
      title: "Initialize Convex",
      command: "npx convex dev",
      description: "This will create a new Convex deployment and give you a URL",
    },
    {
      id: 3,
      title: "Update Environment",
      command: `NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud`,
      description: "Add the deployment URL to your .env.local file",
    },
    {
      id: 4,
      title: "Restart Development Server",
      command: "npm run dev",
      description: "Restart to load the new environment variables",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {hasConvexUrl ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            Development Setup
          </CardTitle>
          <CardDescription>
            {hasConvexUrl
              ? "Your Convex database is configured and ready!"
              : "Set up your Convex database to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasConvexUrl && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Convex URL is missing. Follow the steps below to set up your database.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {setupSteps.map((step) => (
                  <div key={step.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {step.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm flex-1">{step.command}</code>
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(step.command)}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {hasConvexUrl && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>✅ Convex is configured: {env.NEXT_PUBLIC_CONVEX_URL}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={() => window.location.reload()} variant={hasConvexUrl ? "default" : "outline"}>
              {hasConvexUrl ? "Continue to App" : "Refresh to Check"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
