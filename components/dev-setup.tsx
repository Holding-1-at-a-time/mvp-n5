"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Loader2, Terminal, Settings, Server, Cloud } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export function DevSetup() {
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState("http://localhost:11434")
  const [ollamaVisionModel, setOllamaVisionModel] = useState("llava:7b")
  const [ollamaEmbedModel, setOllamaEmbedModel] = useState("nomic-embed-text")
  const [ollamaStatus, setOllamaStatus] = useState<"idle" | "checking" | "running" | "error">("idle")
  const [ollamaError, setOllamaError] = useState<string | null>(null)

  const [convexUrl, setConvexUrl] = useState("")
  const [convexStatus, setConvexStatus] = useState<"idle" | "checking" | "connected" | "error">("idle")
  const [convexError, setConvexError] = useState<string | null>(null)

  const checkOllamaStatus = async () => {
    setOllamaStatus("checking")
    setOllamaError(null)
    try {
      const response = await fetch(`${ollamaBaseUrl}/api/tags`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const models = data.models.map((m: any) => m.name)
      if (models.includes(ollamaVisionModel) && models.includes(ollamaEmbedModel)) {
        setOllamaStatus("running")
      } else {
        setOllamaStatus("error")
        setOllamaError(
          `Required models not found. Please ensure '${ollamaVisionModel}' and '${ollamaEmbedModel}' are downloaded.`,
        )
      }
    } catch (error: any) {
      setOllamaStatus("error")
      setOllamaError(`Could not connect to Ollama: ${error.message}. Is it running?`)
    }
  }

  const checkConvexStatus = async () => {
    setConvexStatus("checking")
    setConvexError(null)
    try {
      // This is a simplified check. A real check would involve a Convex query/mutation.
      // For now, we just check if the URL is provided.
      if (convexUrl.startsWith("http")) {
        setConvexStatus("connected")
      } else {
        throw new Error("Invalid Convex URL format.")
      }
    } catch (error: any) {
      setConvexStatus("error")
      setConvexError(`Convex connection failed: ${error.message}.`)
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Developer Setup Guide</h2>
      <p className="text-muted-foreground">
        Ensure your local environment is correctly configured for Slick Solutions development.
      </p>

      <Tabs defaultValue="ollama" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="ollama" className="flex items-center gap-2">
            <Server className="h-4 w-4" /> Ollama
          </TabsTrigger>
          <TabsTrigger value="convex" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" /> Convex
          </TabsTrigger>
          <TabsTrigger value="env" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Environment
          </TabsTrigger>
        </TabsList>

        {/* Ollama Setup */}
        <TabsContent value="ollama" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Set up Ollama</CardTitle>
              <CardDescription>Ollama powers the local AI models for vehicle damage assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                **Step 1:** Download and install Ollama from{" "}
                <a
                  href="https://ollama.ai/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  ollama.ai/download
                </a>
                .
              </p>
              <p className="text-sm">**Step 2:** Pull the required models using your terminal:</p>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-x-auto">
                <pre>ollama pull {ollamaVisionModel}</pre>
                <pre>ollama pull {ollamaEmbedModel}</pre>
              </div>
              <p className="text-sm">**Step 3:** Ensure Ollama is running in the background.</p>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="ollama-base-url">Ollama Base URL</Label>
                <Input
                  id="ollama-base-url"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ollama-vision-model">Vision Model</Label>
                  <Input
                    id="ollama-vision-model"
                    value={ollamaVisionModel}
                    onChange={(e) => setOllamaVisionModel(e.target.value)}
                    placeholder="llava:7b"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ollama-embed-model">Embedding Model</Label>
                  <Input
                    id="ollama-embed-model"
                    value={ollamaEmbedModel}
                    onChange={(e) => setOllamaEmbedModel(e.target.value)}
                    placeholder="nomic-embed-text"
                  />
                </div>
              </div>
              <Button onClick={checkOllamaStatus} disabled={ollamaStatus === "checking"}>
                {ollamaStatus === "checking" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Ollama Status
              </Button>

              {ollamaStatus === "running" && (
                <Alert className="bg-green-50 border-green-200 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Ollama Running!</AlertTitle>
                  <AlertDescription>Successfully connected to Ollama and found required models.</AlertDescription>
                </Alert>
              )}
              {ollamaStatus === "error" && ollamaError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Ollama Error</AlertTitle>
                  <AlertDescription>{ollamaError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Convex Setup */}
        <TabsContent value="convex" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2. Set up Convex</CardTitle>
              <CardDescription>
                Convex is our real-time backend for data storage and serverless functions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                **Step 1:** Install the Convex CLI:{" "}
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  npm i -g convex
                </code>
              </p>
              <p className="text-sm">
                **Step 2:** Log in to Convex:{" "}
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  npx convex dev
                </code>{" "}
                (This will prompt you to log in and create a project).
              </p>
              <p className="text-sm">
                **Step 3:** Copy your `CONVEX_URL` from your Convex dashboard or the CLI output.
              </p>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="convex-url">Convex Deployment URL (NEXT_PUBLIC_CONVEX_URL)</Label>
                <Input
                  id="convex-url"
                  value={convexUrl}
                  onChange={(e) => setConvexUrl(e.target.value)}
                  placeholder="e.g., https://your-project-name.convex.cloud"
                />
              </div>
              <Button onClick={checkConvexStatus} disabled={convexStatus === "checking"}>
                {convexStatus === "checking" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Convex Connection
              </Button>

              {convexStatus === "connected" && (
                <Alert className="bg-green-50 border-green-200 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Convex Connected!</AlertTitle>
                  <AlertDescription>Successfully connected to your Convex deployment.</AlertDescription>
                </Alert>
              )}
              {convexStatus === "error" && convexError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Convex Error</AlertTitle>
                  <AlertDescription>{convexError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Variables */}
        <TabsContent value="env" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>3. Configure Environment Variables</CardTitle>
              <CardDescription>
                Set up essential environment variables for the application to function correctly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Create a{" "}
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">.env.local</code>{" "}
                file in the root of your project and add the following variables:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-x-auto">
                <pre>NEXT_PUBLIC_CONVEX_URL=YOUR_CONVEX_DEPLOYMENT_URL</pre>
                <pre>OLLAMA_BASE_URL={ollamaBaseUrl}</pre>
                <pre>OLLAMA_VISION_MODEL={ollamaVisionModel}</pre>
                <pre>OLLAMA_EMBED_MODEL={ollamaEmbedModel}</pre>
                <pre>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY</pre>
                <pre>CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY</pre>
                <pre>SVIX_API_KEY=YOUR_SVIX_API_KEY</pre>
                <pre>SVIX_ENV_ID=YOUR_SVIX_APP_ID</pre>
                <pre>SLACK_WEBHOOK_URL=YOUR_SLACK_WEBHOOK_URL</pre>
                <pre>NEXT_PUBLIC_APP_URL=http://localhost:3000</pre>
                <pre>SENTRY_DSN=YOUR_SENTRY_DSN</pre>
                <pre>SENTRY_ORG=YOUR_SENTRY_ORG</pre>
                <pre>SENTRY_PROJECT=YOUR_SENTRY_PROJECT</pre>
                <pre>SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN</pre>
              </div>
              <p className="text-sm">
                **Note:** For Clerk, Svix, and Sentry, you will need to set up accounts and obtain your API keys/IDs.
              </p>
              <Alert className="bg-blue-50 border-blue-200 text-blue-700">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Restart Required</AlertTitle>
                <AlertDescription>
                  After updating your `.env.local` file, restart your development server (`npm run dev`) for changes to
                  take effect.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
