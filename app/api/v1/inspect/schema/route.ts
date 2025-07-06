import { NextResponse } from "next/server"

const V1Schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Vehicle Inspection API v1",
  description: "Image-based vehicle inspection API for damage detection and assessment",
  type: "object",
  required: ["vin", "images"],
  properties: {
    vin: {
      type: "string",
      pattern: "^[A-HJ-NPR-Z0-9]{17}$",
      description: "17-character Vehicle Identification Number",
    },
    images: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: {
        type: "string",
        format: "uri",
        description: "URL to uploaded image file",
      },
      description: "Array of image URLs for inspection",
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
      },
    },
  },
  additionalProperties: false,
  examples: [
    {
      vin: "1HGBH41JXMN109186",
      images: ["https://example.com/front.jpg", "https://example.com/rear.jpg", "https://example.com/side.jpg"],
      metadata: {
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: "San Francisco, CA",
        },
        inspector: {
          id: "inspector_123",
          name: "John Doe",
        },
      },
    },
  ],
}

const V1ResponseSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Vehicle Inspection Response v1",
  type: "object",
  required: ["success", "inspectionId"],
  properties: {
    success: { type: "boolean" },
    inspectionId: { type: "string" },
    status: {
      type: "string",
      enum: ["pending", "processing", "completed", "failed"],
    },
    vehicle: {
      type: "object",
      properties: {
        make: { type: "string" },
        model: { type: "string" },
        year: { type: "string" },
        trim: { type: "string" },
      },
    },
    damages: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string" },
          severity: { type: "string", enum: ["minor", "moderate", "severe"] },
          location: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          estimatedCost: { type: "number", minimum: 0 },
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
      },
    },
    apiVersion: { type: "string", const: "1.0" },
  },
}

export async function GET() {
  return NextResponse.json({
    request: V1Schema,
    response: V1ResponseSchema,
    version: "1.0",
    stable: true,
    deprecated: false,
    documentation: "https://docs.slicksolutions.com/api/v1/inspect",
  })
}
