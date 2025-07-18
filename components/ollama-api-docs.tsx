"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Book, Zap } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIAssessmentIntegration } from "./ai-assessment-integration"

export function OllamaApiDocs() {
  const [activeTab, setActiveTab] = useState("overview")

  const apiEndpoints = {
    v1: {
      assess: "/api/ai/v1/assess",
      inspect: "/api/v1/inspect",
      inspectSchema: "/api/v1/inspect/schema",
    },
    v2: {
      assess: "/api/ai/v2/assess",
      inspect: "/api/v2/inspect",
      inspectSchema: "/api/v2/inspect/schema",
    },
  }

  const codeExamples = {
    v1AssessRequest: `
fetch('/api/ai/v1/assess', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imageUrls: ['https://example.com/car-front.jpg', 'https://example.com/car-side.jpg'],
    vinNumber: '1HGBH41JXMN109186'
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
`,
    v1AssessResponse: `
{
  "damage": [
    {
      "type": "dent",
      "location": "driver door",
      "severity": "medium",
      "description": "Small dent on the lower part of the driver's side door.",
      "estimatedRepairCost": 280
    },
    {
      "type": "scratch",
      "location": "front bumper",
      "severity": "low",
      "description": "Light scratch on the passenger side of the front bumper.",
      "estimatedRepairCost": 150
    }
  ],
  "overallCondition": "good",
  "recommendations": [
    "Repair driver door dent.",
    "Polish front bumper scratch.",
    "Perform a full vehicle detail."
  ],
  "totalEstimatedCost": 430
}
`,
    v2AssessRequest: `
fetch('/api/ai/v2/assess', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imageUrls: ['https://example.com/car-front.jpg'],
    vinNumber: '1HGBH41JXMN109186',
    vinDecodedSpecs: {
      "Make": "Toyota",
      "Model": "Camry",
      "ModelYear": "2020",
      "BodyClass": "Sedan"
    }
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
`,
    v2AssessResponse: `
{
  "damage": [
    {
      "type": "dent",
      "location": "driver door",
      "severity": "medium",
      "description": "Small dent on the lower part of the driver's side door.",
      "estimatedRepairCost": 280,
      "confidence": 0.95
    }
  ],
  "overallCondition": "good",
  "recommendations": [
    "Repair driver door dent.",
    "Perform a full vehicle detail."
  ],
  "totalEstimatedCost": 280,
  "vinDecodedSpecs": {
    "Make": "Toyota",
    "Model": "Camry",
    "ModelYear": "2020",
    "BodyClass": "Sedan"
  }
}
`,
    inspectV1PostRequest: `
fetch('/api/v1/inspect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    vinNumber: '1HGBH41JXMN109186',
    imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg']
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
`,
    inspectV1PostResponse: `
{
  "success": true,
  "inspectionId": "some_convex_id_string",
  "status": "pending",
  "message": "Inspection created and processing initiated."
}
`,
    inspectV1GetRequest: `
fetch('/api/v1/inspect?id=some_convex_id_string')
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
`,
    inspectV1GetResponse: `
{
  "_id": "some_convex_id_string",
  "_creationTime": 1704567890123,
  "vinNumber": "1HGBH41JXMN109186",
  "imageUrls": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
  "status": "processing",
  "createdAt": 1704567890123,
  "assessmentResult": null
}
`,
  }

  const CodeBlock = ({ children }: { children: string }) => (
    <ScrollArea className="h-[200px] w-full rounded-md border bg-gray-50 dark:bg-gray-900 p-4 text-sm font-mono">
      <pre className="whitespace-pre-wrap break-all">{children.trim()}</pre>
    </ScrollArea>
  )

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">API Documentation</h2>
      <p className="text-muted-foreground">
        Explore the API endpoints for integrating with Slick Solutions' AI assessment and inspection management.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Book className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="ai-v1" className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> AI Assess (v1)
          </TabsTrigger>
          <TabsTrigger value="ai-v2" className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> AI Assess (v2)
          </TabsTrigger>
          <TabsTrigger value="inspect-v1" className="flex items-center gap-2">
            <Code className="h-4 w-4" /> Inspect (v1)
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>Understand the core functionalities provided by our API.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Our API allows you to programmatically interact with the Slick Solutions platform, enabling features
                like AI-powered vehicle damage assessment and inspection lifecycle management.
              </p>
              <h3 className="font-semibold text-lg">Key Endpoints:</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    /api/ai/v1/assess
                  </code>
                  : Basic AI damage assessment.
                </li>
                <li>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    /api/ai/v2/assess
                  </code>
                  : Enhanced AI damage assessment with VIN-decoded specs.
                </li>
                <li>
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    /api/v1/inspect
                  </code>
                  : Manage vehicle inspection records.
                </li>
              </ul>
              <p className="text-sm">
                All API responses are in JSON format. Ensure you handle appropriate HTTP status codes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assess (v1) Tab */}
        <TabsContent value="ai-v1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Assessment API (v1)
              </CardTitle>
              <CardDescription>Endpoint for basic AI-powered vehicle damage assessment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="font-semibold text-lg">Endpoint:</h3>
              <p className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md font-mono text-sm">
                POST {apiEndpoints.v1.assess}
              </p>

              <h3 className="font-semibold text-lg">Request Body:</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Send a JSON object with `imageUrls` (array of strings) and `vinNumber` (string).
              </p>
              <CodeBlock>{codeExamples.v1AssessRequest}</CodeBlock>

              <h3 className="font-semibold text-lg">Response Body:</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Returns a JSON object containing detected damages, overall condition, recommendations, and total
                estimated cost.
              </p>
              <CodeBlock>{codeExamples.v1AssessResponse}</CodeBlock>

              <Separator />

              <h3 className="font-semibold text-lg">Live Test:</h3>
              <AIAssessmentIntegration apiEndpoint={apiEndpoints.v1.assess} showVinDecodedSpecs={false} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assess (v2) Tab */}
        <TabsContent value="ai-v2" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Assessment API (v2)
              </CardTitle>
              <CardDescription>
                Enhanced AI-powered vehicle damage assessment with optional VIN-decoded specifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="font-semibold text-lg">Endpoint:</h3>
              <p className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md font-mono text-sm">
                POST {apiEndpoints.v2.assess}
              </p>

              <h3 className="font-semibold text-lg">Request Body:</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Send a JSON object with `imageUrls` (array of strings), `vinNumber` (string), and optionally
                `vinDecodedSpecs` (object).
              </p>
              <CodeBlock>{codeExamples.v2AssessRequest}</CodeBlock>

              <h3 className="font-semibold text-lg">Response Body:</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Returns a JSON object similar to v1, but includes `confidence` for each damage and `vinDecodedSpecs` if
                provided in the request.
              </p>
              <CodeBlock>{codeExamples.v2AssessResponse}</CodeBlock>

              <Separator />

              <h3 className="font-semibold text-lg">Live Test:</h3>
              <AIAssessmentIntegration apiEndpoint={apiEndpoints.v2.assess} showVinDecodedSpecs={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspect (v1) Tab */}
        <TabsContent value="inspect-v1" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Inspection Management API (v1)
              </CardTitle>
              <CardDescription>Endpoints for creating and retrieving vehicle inspection records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="font-semibold text-lg">Create Inspection:</h3>
              <p className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md font-mono text-sm">
                POST {apiEndpoints.v1.inspect}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Creates a new inspection record and initiates AI processing.
              </p>
              <h4 className="font-medium text-base">Request Body:</h4>
              <CodeBlock>{codeExamples.inspectV1PostRequest}</CodeBlock>
              <h4 className="font-medium text-base">Response Body:</h4>
              <CodeBlock>{codeExamples.inspectV1PostResponse}</CodeBlock>

              <Separator />

              <h3 className="font-semibold text-lg">Get Inspection Status:</h3>
              <p className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md font-mono text-sm">
                GET {apiEndpoints.v1.inspect}?id=&#123;inspectionId&#125;
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Retrieves the current status and results of an inspection.
              </p>
              <h4 className="font-medium text-base">Request Example:</h4>
              <CodeBlock>{codeExamples.inspectV1GetRequest}</CodeBlock>
              <h4 className="font-medium text-base">Response Example:</h4>
              <CodeBlock>{codeExamples.inspectV1GetResponse}</CodeBlock>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
