"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, Phone } from "lucide-react"
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

const mockSchedule: DaySchedule[] = [
  {
    date: "2025-01-06",
    dayName: "Mon",
    dayNumber: 6,
    slots: [
      { time: "9:00 AM", available: true, recommended: true },
      { time: "11:00 AM", available: true },
      { time: "2:00 PM", available: false },
    ],
  },
  {
    date: "2025-01-07",
    dayName: "Tue",
    dayNumber: 7,
    slots: [
      { time: "10:00 AM", available: true },
      { time: "1:00 PM", available: true, recommended: true },
      { time: "3:00 PM", available: true },
    ],
  },
  {
    date: "2025-01-08",
    dayName: "Wed",
    dayNumber: 8,
    slots: [
      { time: "9:00 AM", available: false },
      { time: "2:00 PM", available: true },
      { time: "4:00 PM", available: true },
    ],
  },
  {
    date: "2025-01-09",
    dayName: "Thu",
    dayNumber: 9,
    slots: [
      { time: "8:00 AM", available: true },
      { time: "11:00 AM", available: true, recommended: true },
      { time: "3:00 PM", available: false },
    ],
  },
  {
    date: "2025-01-10",
    dayName: "Fri",
    dayNumber: 10,
    slots: [
      { time: "9:00 AM", available: true },
      { time: "1:00 PM", available: true },
      { time: "4:00 PM", available: true },
    ],
  },
]

export default function SchedulePage() {
  const [selectedSlot, setSelectedSlot] = useState<{ day: DaySchedule; slot: TimeSlot } | null>(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: "John Doe",
    phone: "(555) 123-4567",
    email: "john.doe@email.com",
  })

  const estimateTotal = 886.4 // From previous estimate

  const handleSlotSelect = (day: DaySchedule, slot: TimeSlot) => {
    if (slot.available) {
      setSelectedSlot({ day, slot })
    }
  }

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
          <Badge variant="secondary" className="text-sm">
            AI Recommended
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Available Appointments
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Select your preferred appointment time. AI-recommended slots are highlighted.
                </p>
              </CardHeader>
              <CardContent>
                {/* Calendar Strip */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {mockSchedule.map((day) => (
                    <div key={day.date} className="text-center">
                      <div className="font-medium text-sm text-gray-600 mb-2">
                        {day.dayName} {day.dayNumber}
                      </div>
                      <div className="space-y-2">
                        {day.slots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={
                              selectedSlot?.day.date === day.date && selectedSlot?.slot.time === slot.time
                                ? "default"
                                : slot.recommended
                                  ? "secondary"
                                  : "outline"
                            }
                            size="sm"
                            disabled={!slot.available}
                            onClick={() => handleSlotSelect(day, slot)}
                            className={`w-full text-xs relative ${
                              slot.recommended && selectedSlot?.day.date !== day.date
                                ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
                                : ""
                            } ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {slot.time}
                            {slot.recommended && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>AI Recommended</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full"></div>
                    <span>Unavailable</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Selected Appointment */}
            {selectedSlot && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">
                        {selectedSlot.day.dayName}, January {selectedSlot.day.dayNumber}
                      </div>
                      <div className="text-sm text-gray-600">2025</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{selectedSlot.slot.time}</div>
                      <div className="text-sm text-gray-600">Estimated 2-3 hours</div>
                    </div>
                  </div>
                  {selectedSlot.slot.recommended && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      AI Recommended - Optimal timing
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  <div>
                    <div className="font-medium">{customerInfo.name}</div>
                    <div className="text-sm text-gray-600">Customer</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{customerInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">Slick Solutions Auto Care</span>
                </div>
              </CardContent>
            </Card>

            {/* Service Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Front Bumper Scratch Repair</span>
                    <span>$150.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Door Dent Removal (PDR)</span>
                    <span>$280.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paint Touch-up & Blend</span>
                    <span>$450.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${estimateTotal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirm Button */}
            <Link href="/invoice">
              <Button className="w-full" size="lg" disabled={!selectedSlot}>
                Confirm & Pay
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            </Link>

            {!selectedSlot && (
              <p className="text-center text-gray-500 text-sm">Please select an appointment time to continue</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
