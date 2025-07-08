import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageIds, imageUrls } = await request.json()

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Return fixture JSON data simulating AI assessment
    const assessmentResult = {
      damages: [
        {
          type: "dent",
          severity: "moderate",
          location: "front_bumper",
          description: "Medium-sized dent on front bumper, approximately 4 inches in diameter",
          confidence: 0.85,
          imageId: imageIds[0],
          boundingBox: { x: 100, y: 150, width: 80, height: 60 },
        },
        {
          type: "scratch",
          severity: "minor",
          location: "driver_door",
          description: "Surface scratch on driver side door, paint damage visible",
          confidence: 0.92,
          imageId: imageIds[1],
          boundingBox: { x: 200, y: 300, width: 120, height: 20 },
        },
        {
          type: "crack",
          severity: "severe",
          location: "windshield",
          description: "Spider crack in windshield, requires full replacement",
          confidence: 0.78,
          imageId: imageIds[2] || imageIds[0],
          boundingBox: { x: 300, y: 100, width: 150, height: 80 },
        },
      ],
      estimates: [
        {
          description: "Front bumper dent repair and repaint",
          laborHours: 3.5,
          laborRate: 85,
          partsCost: 150,
          totalCost: 447.5,
          category: "body_work",
        },
        {
          description: "Door scratch touch-up and blend",
          laborHours: 1.5,
          laborRate: 85,
          partsCost: 45,
          totalCost: 172.5,
          category: "paint_work",
        },
        {
          description: "Windshield replacement with OEM glass",
          laborHours: 2,
          laborRate: 85,
          partsCost: 350,
          totalCost: 520,
          category: "glass_work",
        },
      ],
      metadata: {
        processingTime: 2.3,
        confidence: 0.85,
        aiModel: "granite3.2-vision:latest",
        timestamp: Date.now(),
      },
    }

    return NextResponse.json(assessmentResult)
  } catch (error) {
    console.error("AI assessment failed:", error)
    return NextResponse.json({ error: "AI assessment failed" }, { status: 500 })
  }
}
