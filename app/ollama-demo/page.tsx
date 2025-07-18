import { OllamaDamageDetector } from "@/components/ollama-damage-detector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Brain, Zap, Eye, Database } from "lucide-react"

export const dynamic = "force-dynamic"

export default function OllamaDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Ollama AI Integration Demo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience real-time vehicle damage detection powered by Ollama's vision models and embedding generation for
          comprehensive damage assessment.
        </p>
      </div>

      {/* Feature Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-blue-600" />
              Vision Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Llama3.2-Vision model analyzes vehicle images to detect and classify damage types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-green-600" />
              Embeddings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              mxbai-embed-large generates semantic embeddings for damage similarity search
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-purple-600" />
              Smart Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Identifies damage type, severity, location with confidence scores and bounding boxes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-orange-600" />
              Real-time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fast processing with latency monitoring and automatic cost estimation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
          <CardDescription>Current Ollama model configuration and capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Vision Model</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <Badge variant="outline">llama3.2-vision</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-mono">0.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Top-p:</span>
                  <span className="font-mono">0.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Images:</span>
                  <span className="font-mono">10</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Embedding Model</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <Badge variant="outline">mxbai-embed-large</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="font-mono">1024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Context Length:</span>
                  <span className="font-mono">512 tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Processing:</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Supported Damage Types</h4>
            <div className="flex flex-wrap gap-2">
              {[
                { type: "Dents", icon: "🔨" },
                { type: "Scratches", icon: "✂️" },
                { type: "Cracks", icon: "💥" },
                { type: "Rust", icon: "🦠" },
                { type: "Paint Damage", icon: "🎨" },
                { type: "Glass Damage", icon: "🪟" },
              ].map(({ type, icon }) => (
                <Badge key={type} variant="outline" className="flex items-center gap-1">
                  <span>{icon}</span>
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Demo Component */}
      <OllamaDamageDetector
        onAssessmentComplete={(assessment) => {
          console.log("Assessment completed:", assessment)
        }}
      />

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Enter a valid 17-character VIN number for the vehicle you want to assess</li>
            <li>Add one or more vehicle image URLs showing different angles and potential damage areas</li>
            <li>Click "Assess Damage" to start the Ollama AI analysis process</li>
            <li>Wait for the vision model to process images and generate damage detection results</li>
            <li>Review the detected damages with confidence scores, locations, and repair estimates</li>
            <li>Examine the generated embeddings for semantic similarity analysis</li>
          </ol>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Use high-quality images with good lighting for better detection accuracy</li>
              <li>Include multiple angles of the same damage for comprehensive analysis</li>
              <li>Ensure images show the full context of damage areas</li>
              <li>Processing time varies based on image count and Ollama server performance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
