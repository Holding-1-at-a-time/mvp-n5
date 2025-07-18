import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { ollama } from "@ai-sdk/ollama"
import { z } from "zod"
import { env } from "@/lib/env"
import { trackApiCall } from "@/lib/observability"

// Define the schema for the AI assessment response
const assessmentSchema = z.object({
  damage: z
    .array(
      z.object({
        type: z.string().describe("Type of damage (e.g., 'dent', 'scratch', 'paint chip')"),
        location: z
          .string()
          .describe("Specific location on the vehicle (e.g., 'front bumper', 'driver door', 'rear quarter panel')"),
        severity: z.enum(["low", "medium", "high"]).describe("Severity of the damage"),
        description: z.string().describe("Detailed description of the damage"),
        estimatedRepairCost: z.number().describe("Estimated cost to repair this specific damage in USD"),
      }),
    )
    .describe("Array of detected damages"),
  overallCondition: z.enum(["excellent", "good", "fair", "poor"]).describe("Overall condition of the vehicle"),
  recommendations: z.array(z.string()).describe("Recommended repair actions or next steps"),
  totalEstimatedCost: z.number().describe("Total estimated cost for all detected repairs in USD"),
})

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let status = "success"
  let errorMessage = ""

  try {
    const { imageUrls, vinNumber } = await req.json()

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      status = "bad_request"
      errorMessage = "Missing imageUrls in request body."
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    if (!vinNumber) {
      status = "bad_request"
      errorMessage = "Missing vinNumber in request body."
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const model = ollama(env.OLLAMA_BASE_URL).chat(env.OLLAMA_VISION_MODEL)

    const prompt = `
      You are an expert vehicle damage assessor. Analyze the provided images of a vehicle with VIN ${vinNumber}.
      Identify all visible damages, their type, precise location, severity (low, medium, high), and provide a brief description.
      Estimate the repair cost for each individual damage in USD.
      Finally, provide an overall condition assessment and general repair recommendations.

      Consider the following for severity and cost:
      - Low: Minor cosmetic issues, easily fixable, e.g., light scratches, small chips.
      - Medium: Noticeable damage requiring professional attention, e.g., small dents, deep scratches, minor paint damage.
      - High: Significant damage affecting appearance or function, e.g., large dents, structural damage, extensive paint damage, broken parts.

      Provide the output in a structured JSON format according to the schema.
    `

    const { object: assessment } = await generateObject({
      model: model,
      prompt: prompt,
      schema: assessmentSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imageUrls.map((url: string) => ({ type: "image" as const, image: url })),
          ],
        },
      ],
    })

    return NextResponse.json(assessment)
  } catch (error: any) {
    console.error("AI assessment failed:", error)
    status = "error"
    errorMessage = error.message || "Internal server error during AI assessment."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  } finally {
    trackApiCall("ai_assessment_v1", Date.now() - startTime, status, errorMessage)
  }
}
