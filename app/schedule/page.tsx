"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Calendar } from "lucide-react"
import Link from "next/link"

interface TimeSlot {
  time: string
  available: boolean
  recommended?: boolean
}

interface DaySchedule {
  date: string
  dayName: string
  dayNumber: number
  slots: TimeSlot[]
}

export default function SchedulePage() {
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)

  // Generate next 7 days
  const generateSchedule = (): DaySchedule[] => {
    const days = []
    const today = new Date()

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const daySchedule: DaySchedule = {
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
        slots: [],
      }

      // Generate time slots for each day
      const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
      const availableSlots = timeSlots.slice(0, Math.floor(Math.random() * 4) + 2) // 2-5 slots per day

      daySchedule.slots = availableSlots.map((time, index) => ({
        time,
        available: true,
        recommended: index === 0 && i <= 3, // First slot of first 3 days are recommended
      }))

      days.push(daySchedule)
    }

    return days
  }

  const [schedule] = useState<DaySchedule[]>(generateSchedule())

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time })
  }

  const getSelectedSlotInfo = () => {
    if (!selectedSlot) return null

    const day = schedule.find((d) => d.date === selectedSlot.date)
    if (!day) return null

    return {
      dayName: day.dayName,
      dayNumber: day.dayNumber,
      time: selectedSlot.time,
    }
  }

  const selectedInfo = getSelectedSlotInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/estimate">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Schedule Appointment</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* AI Recommendation Banner */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">AI Scheduling Assistant</h3>
                <p className="text-blue-700 text-sm">
                  Based on your vehicle's needs and our availability, we recommend booking within the next 3 days for
                  optimal results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Strip */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {schedule.map((day) => (
                <div key={day.date} className="text-center">
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-600">{day.dayName}</div>
                    <div className="text-lg font-bold">{day.dayNumber}</div>
                  </div>

                  <div className="space-y-2">
                    {day.slots.map((slot) => (
                      <Button
                        key={`${day.date}-${slot.time}`}
                        variant={
                          selectedSlot?.date === day.date && selectedSlot?.time === slot.time
                            ? "default"
                            : slot.recommended
                              ? "secondary"
                              : "outline"
                        }
                        size="sm"
                        className={`w-full text-xs relative ${
                          slot.recommended ? "border-blue-300 bg-blue-50 hover:bg-blue-100" : ""
                        }`}
                        onClick={() => handleSlotSelect(day.date, slot.time)}
                      >
                        {slot.time}
                        {slot.recommended && (
                          <Badge
                            variant="secondary"
                            className="absolute -top-2 -right-2 text-xs bg-blue-600 text-white px-1 py-0"
                          >
                            AI
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Appointment */}
        {selectedInfo && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-green-900 mb-2">Selected Appointment</h3>
                <p className="text-lg text-green-800">
                  {selectedInfo.dayName} {selectedInfo.dayNumber} • {selectedInfo.time}
                </p>
                <p className="text-sm text-green-700 mt-1">Estimated duration: 2-3 hours</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Scratch Buffing</span>
                <span>$50.00</span>
              </div>
              <div className="flex justify-between">
                <span>Leather Care Treatment</span>
                <span>$30.00</span>
              </div>
              <div className="flex justify-between">
                <span>Paint Touch-up</span>
                <span>$75.00</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>$167.40</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirm Button */}
        <Link href="/invoice">
          <Button size="lg" className="w-full" disabled={!selectedSlot}>
            Confirm & Pay
          </Button>
        </Link>

        {!selectedSlot && (
          <p className="text-center text-gray-500 text-sm mt-2">Please select an appointment time to continue</p>
        )}
      </div>
    </div>
  )
}
