"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Code, Database, Eye, Zap, AlertCircle, CheckCircle } from "lucide-react"

export function OllamaApiDocs() {
  const requestExample = `{
  "imageUrls": [
    "https://example.com/vehicle-front.jpg",
    "https://example.com/vehicle-side.jpg"
  ],
  "vinNumber": "1HGBH41JXMN109186",
  "metadata": {
    "inspectionId": "insp_123456",
    "timestamp": 1703097600000
  }
}`

  const responseExample = `{
  "success": true,
  "assessmentId": "assess_1703097600_abc123",
  "vinNumber": "1HGBH41JXMN109186",
  "damages": [
    {
      "id": "damage_1703097600_1",
      "type": "dent",
      "severity": "moderate",
      "location": "front bumper",
      "description": "Small dent with minor paint damage",
      "confidence": 0.85,
      "imageUrl": "https://example.com/vehicle-front.jpg",
      "boundingBox": {
        "x": 150,
        "y": 200,
        "width": 80,
        "height": 60
      },
      "embedding": [0.1, 0.2, 0.3, ...]
    }
  ],
  "embeddings": [
    [0.1, 0.2, 0.3, 0.4, 0.5, ...]
  ],
  "totalEstimate": 450,
  "processingTimeMs": 1250,
  "confidence": 0.85,
  "metadata": {
    "modelVersion": "llama3.2-vision+mxbai-embed-large",
    "processedAt": "2023-12-20T12:00:00.000Z",
    "imageCount": 2,
    "ollamaLatency": 800,
    "embeddingLatency": 300
  }
}`

  const errorExample = `{
  "success": false,
  "error": "Invalid request format",
  "processingTimeMs": 50,
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["vinNumber"],
      "message": "Expected string, received number"
    }
  ]
}`

  const curlExample = `curl -X POST https://your-app.vercel.app/api/ai/v1/assess \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageUrls": [
      "https://example.com/vehicle-front.jpg",
      "https://example.com/vehicle-side.jpg"
    ],
    "vinNumber": "1HGBH41JXMN109186",
    "metadata": {
      "inspectionId": "insp_123456",
      "timestamp": 1703097600000
    }
  }'`

  const jsExample = `// Using fetch API
async function assessVehicleDamage(imageUrls, vinNumber) {
  try {
    const response = await fetch('/api/ai/v1/assess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrls,
        vinNumber,
        metadata: {
          inspectionId: 'insp_' + Date.now(),
          timestamp: Date.now(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error);
    }

    return result;
  } catch (error) {
    console.error('Assessment failed:', error);
    throw error;
  }
}`

  const pythonExample = `import requests
import json

def assess_vehicle_damage(image_urls, vin_number):
    """
    Assess vehicle damage using Ollama AI API
    
    Args:
        image_urls (list): List of vehicle image URLs
        vin_number (str): 17-character VIN number
        
    Returns:
        dict: Assessment results with damages and estimates
    """
    url = "https://your-app.vercel.app/api/ai/v1/assess"
    
    payload = {
        "imageUrls": image_urls,
        "vinNumber": vin_number,
        "metadata": {
            "inspectionId": f"insp_{int(time.time())}",
            "timestamp": int(time.time() * 1000)
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        
        if not result.get("success"):
            raise Exception(f"Assessment failed: {result.get('error')}")
            
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        raise
    except Exception as e:
        print(f"Assessment error: {e}")
        raise

# Example usage
if __name__ == "__main__":
    image_urls = [
        "https://example.com/vehicle-front.jpg",
        "https://example.com/vehicle-side.jpg"
    ]
    vin_number = "1HGBH41JXMN109186"
    
    try:
        result = assess_vehicle_damage(image_urls, vin_number)
        print(f"Found {len(result['damages'])} damages")
        print(f"Total estimate: ${result["totalEstimate"]}")
        print(f"Processing time: {result['processingTimeMs']}ms")
    except Exception as e:
        print(f"Error: {e}")`

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Ollama AI API Documentation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Complete API reference for vehicle damage assessment using Ollama vision models
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            API Overview
          </CardTitle>
          <CardDescription>
            The Ollama AI Assessment API provides real-time vehicle damage detection and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Base URL</h4>
              <code className="block p-2 bg-gray-100 rounded text-sm font-mono">
                https://your-app.vercel.app/api/ai/v1
              </code>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Content Type</h4>
              <code className="block p-2 bg-gray-100 rounded text-sm font-mono">application/json</code>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-semibold">Vision Analysis</h4>
              <p className="text-sm text-muted-foreground">Llama3.2-Vision model for damage detection</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-semibold">Embeddings</h4>
              <p className="text-sm text-muted-foreground">mxbai-embed-large for semantic analysis</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Code className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-semibold">Real-time</h4>
              <p className="text-sm text-muted-foreground">Fast processing with latency monitoring</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800">POST</Badge>
                <code className="font-mono">/api/ai/v1/assess</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Analyze vehicle images for damage detection and generate repair estimates
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800">GET</Badge>
                <code className="font-mono">/api/ai/v1/assess</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Health check endpoint to verify Ollama service status and model availability
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request/Response Examples */}
      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="request">Request</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Format</CardTitle>
              <CardDescription>POST request body schema for damage assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Required Fields</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <code className="font-mono">imageUrls</code>
                    <Badge variant="outline">string[]</Badge>
                  </div>
                  <p className="text-muted-foreground ml-4">
                    Array of vehicle image URLs (1-10 images, HTTPS required)
                  </p>

                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <code className="font-mono">vinNumber</code>
                    <Badge variant="outline">string</Badge>
                  </div>
                  <p className="text-muted-foreground ml-4">17-character Vehicle Identification Number</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Optional Fields</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <code className="font-mono">metadata</code>
                    <Badge variant="outline">object</Badge>
                  </div>
                  <p className="text-muted-foreground ml-4">Additional context including inspectionId and timestamp</p>
                </div>
              </div>

              <ScrollArea className="h-64 w-full border rounded-lg p-4">
                <pre className="text-sm">
                  <code>{requestExample}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Format</CardTitle>
              <CardDescription>Successful assessment response structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Response Fields</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <code>success</code>
                      <Badge variant="outline">boolean</Badge>
                    </div>
                    <div className="flex justify-between">
                      <code>assessmentId</code>
                      <Badge variant="outline">string</Badge>
                    </div>
                    <div className="flex justify-between">
                      <code>damages</code>
                      <Badge variant="outline">array</Badge>
                    </div>
                    <div className="flex justify-between">
                      <code>embeddings</code>
                      <Badge variant="outline">number[][]</Badge>
                    </div>
                    <div className="flex justify-between">
                      <code>totalEstimate</code>
                      <Badge variant="outline">number</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Damage Object</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <code>type</code>
                      <Badge variant="outline">enum</Badge>
                    </div>
                    <div className="flex justify-between">
                      <code>severity</code>
                      <Badge variant="outline">enum</Badge>
                    </div>
                    <div className="flex justify-between">
                      <code>confidence</code>
                      <Badge variant="outline">number</Badge>
                    </div>
                    <div className="flex justify-between">
                      <code>boundingBox</code>
                      <Badge variant="outline">object</Badge>
                    </div>
                    <div className="flex justify-between">
                      <code>embedding</code>
                      <Badge variant="outline">number[]</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-64 w-full border rounded-lg p-4">
                <pre className="text-sm">
                  <code>{responseExample}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
              <CardDescription>Common error responses and status codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">HTTP Status Codes</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">200</Badge>
                      <span className="text-sm">OK</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Successful assessment</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">400</Badge>
                      <span className="text-sm">Bad Request</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Invalid request format</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">500</Badge>
                      <span className="text-sm">Internal Server Error</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Ollama service error</span>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">503</Badge>
                      <span className="text-sm">Service Unavailable</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Ollama service down</span>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-48 w-full border rounded-lg p-4">
                <pre className="text-sm">
                  <code>{errorExample}</code>
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Tabs defaultValue="curl" className="w-full">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>

            <TabsContent value="curl">
              <Card>
                <CardHeader>
                  <CardTitle>cURL Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48 w-full border rounded-lg p-4">
                    <pre className="text-sm">
                      <code>{curlExample}</code>
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="javascript">
              <Card>
                <CardHeader>
                  <CardTitle>JavaScript Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64 w-full border rounded-lg p-4">
                    <pre className="text-sm">
                      <code>{jsExample}</code>
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="python">
              <Card>
                <CardHeader>
                  <CardTitle>Python Example</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 w-full border rounded-lg p-4">
                    <pre className="text-sm">
                      <code>{pythonExample}</code>
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Rate Limits and Best Practices */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Requests per minute:</span>
                <Badge variant="outline">60</Badge>
              </div>
              <div className="flex justify-between">
                <span>Concurrent requests:</span>
                <Badge variant="outline">4</Badge>
              </div>
              <div className="flex justify-between">
                <span>Max image size:</span>
                <Badge variant="outline">10MB</Badge>
              </div>
              <div className="flex justify-between">
                <span>Max images per request:</span>
                <Badge variant="outline">10</Badge>
              </div>
              <div className="flex justify-between">
                <span>Request timeout:</span>
                <Badge variant="outline">30s</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use high-quality images with good lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Include multiple angles of damage areas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Implement retry logic with exponential backoff</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Monitor processing times and confidence scores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Cache results to avoid duplicate processing</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
