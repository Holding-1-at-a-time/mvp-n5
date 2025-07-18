import { NextResponse } from "next/server"
import { z } from "zod"

const V2Schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Vehicle Inspection API v2",
  description: "Enhanced vehicle inspection API with video support, streaming, and partial results",
  type: "object",
  required: ["vin", "media"],
  properties: {
    vin: {
      type: "string",
      pattern: "^[A-HJ-NPR-Z0-9]{17}$",
      description: "17-character Vehicle Identification Number",
    },
    media: {
      type: "array",
      minItems: 1,
      maxItems: 50,
      items: {
        type: "object",
        required: ["type", "url"],
        properties: {
          type: {
            type: "string",
            enum: ["image", "video"],
            description: "Media type - image or video",
          },
          url: {
            type: "string",
            format: "uri",
            description: "URL to uploaded media file",
          },
          timestamp: {
            type: "number",
            description: "Unix timestamp when media was captured",
          },
          metadata: {
            type: "object",
            properties: {
              width: { type: "number", minimum: 1 },
              height: { type: "number", minimum: 1 },
              duration: { type: "number", minimum: 0, description: "Video duration in seconds" },
              format: { type: "string", description: "File format (jpg, png, mp4, etc.)" },
            },
          },
        },
      },
    },
    options: {
      type: "object",
      properties: {
        enableStreaming: {
          type: "boolean",
          default: false,
          description: "Enable real-time streaming of results",
        },
        partialResults: {
          type: "boolean",
          default: false,
          description: "Return partial results as they become available",
        },
        confidenceThreshold: {
          type: "number",
          minimum: 0,
          maximum: 1,
          default: 0.7,
          description: "Minimum confidence threshold for damage detection",
        },
        priority: {
          type: "string",
          enum: ["low", "normal", "high"],
          default: "normal",
          description: "Processing priority level",
        },
        webhookUrl: {
          type: "string",
          format: "uri",
          description: "Webhook URL for completion notifications",
        },
      },
    },
    metadata: {
      type: "object",
      properties: {
        location: {
          type: "object",
          properties: {
            latitude: { type: "number", minimum: -90, maximum: 90 },
            longitude: { type: "number", minimum: -180, maximum: 180 },
            address: { type: "string", maxLength: 500 },
          },
        },
        inspector: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", maxLength: 100 },
          },
        },
        customerInfo: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", maxLength: 100 },
            contact: { type: "string", maxLength: 100 },
          },
        },
      },
    },
  },
  examples: [
    {
      vin: "1HGBH41JXMN109186",
      media: [
        {
          type: "image",
          url: "https://example.com/front.jpg",
          timestamp: 1703097600,
          metadata: { width: 1920, height: 1080, format: "jpg" },
        },
        {
          type: "video",
          url: "https://example.com/walkround.mp4",
          timestamp: 1703097660,
          metadata: { width: 1920, height: 1080, duration: 45, format: "mp4" },
        },
      ],
      options: {
        enableStreaming: true,
        partialResults: true,
        confidenceThreshold: 0.8,
        priority: "high",
        webhookUrl: "https://example.com/webhook",
      },
    },
  ],
}

const V2ResponseSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Vehicle Inspection Response v2",
  type: "object",
  required: ["success", "inspectionId", "apiVersion"],
  properties: {
    success: { type: "boolean" },
    inspectionId: { type: "string" },
    status: {
      type: "string",
      enum: ["processing", "completed", "failed", "partial"],
    },
    streamUrl: {
      type: "string",
      format: "uri",
      description: "WebSocket URL for streaming results (when streaming enabled)",
    },
    estimatedCompletion: {
      type: "string",
      format: "date-time",
      description: "Estimated completion time",
    },
    processingTime: {
      type: "number",
      description: "Processing time in milliseconds",
    },
    vehicle: {
      type: "object",
      properties: {
        make: { type: "string" },
        model: { type: "string" },
        year: { type: "string" },
        trim: { type: "string" },
        bodyClass: { type: "string" },
        fuelType: { type: "string" },
        driveType: { type: "string" },
      },
    },
    damages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          severity: { type: "string", enum: ["minor", "moderate", "severe"] },
          location: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          boundingBox: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" },
              width: { type: "number" },
              height: { type: "number" },
            },
          },
          mediaSource: { type: "string", description: "Which media file detected this damage" },
          timestamp: { type: "number", description: "When damage was detected" },
        },
      },
    },
    estimate: {
      type: "object",
      properties: {
        totalCost: { type: "number", minimum: 0 },
        laborHours: { type: "number", minimum: 0 },
        partsCost: { type: "number", minimum: 0 },
        laborCost: { type: "number", minimum: 0 },
        breakdown: {
          type: "array",
          items: {
            type: "object",
            properties: {
              damageId: { type: "string" },
              description: { type: "string" },
              cost: { type: "number" },
              category: { type: "string" },
            },
          },
        },
      },
    },
    apiVersion: { type: "string", const: "2.0" },
  },
}

const inspectionRequestSchema = z.object({
  vinNumber: z.string().min(17).max(17).describe("Vehicle Identification Number (VIN)"),
  imageUrls: z.array(z.string().url()).min(1).describe("Array of URLs to vehicle images"),
  customerId: z.string().optional().describe("Optional ID of the customer associated with the inspection"),
  shopId: z.string().optional().describe("Optional ID of the shop performing the inspection"),
})

const inspectionResponseSchema = z.object({
  success: z.boolean().describe("Indicates if the operation was successful"),
  inspectionId: z.string().describe("Unique ID of the created inspection"),
  status: z.enum(["pending", "processing", "complete", "failed"]).describe("Current status of the inspection"),
  message: z.string().optional().describe("A descriptive message about the operation"),
})

export async function GET() {
  return NextResponse.json({
    request: V2Schema,
    response: V2ResponseSchema,
    version: "2.0",
    stable: false,
    deprecated: false,
    features: [
      "Video processing support",
      "Real-time streaming results",
      "Partial result delivery",
      "Enhanced vehicle metadata",
      "Webhook notifications",
      "Priority processing",
    ],
    documentation: "https://docs.slicksolutions.com/api/v2/inspect",
    migration: "https://docs.slicksolutions.com/api/migration/v1-to-v2",
    zodRequest: inspectionRequestSchema.shape,
    zodResponse: inspectionResponseSchema.shape,
  })
}
