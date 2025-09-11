import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Event } from "@/lib/models/Event"
import { User } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth/jwt"

export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    await connectDB()

    const { token, location } = await request.json()
    const authHeader = request.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(authHeader.substring(7))
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const event = await Event.findById(params.eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if user is registered for the event
    const isRegistered = event.participants.some((p) => p.userId.toString() === decoded.userId)
    if (!isRegistered) {
      return NextResponse.json({ error: "Not registered for this event" }, { status: 403 })
    }

    // Check if already marked attendance
    const existingAttendance = event.attendance?.find((a) => a.userId.toString() === decoded.userId)
    if (existingAttendance) {
      return NextResponse.json({ error: "Attendance already marked" }, { status: 400 })
    }

    // Verify attendance is within event time
    const now = new Date()
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)

    if (now < eventStart || now > eventEnd) {
      return NextResponse.json({ error: "Attendance can only be marked during event time" }, { status: 400 })
    }

    // Mark attendance
    if (!event.attendance) event.attendance = []
    event.attendance.push({
      userId: decoded.userId,
      timestamp: now,
      location: location || "Unknown",
      verified: true,
    })

    await event.save()

    // Update user's attended events
    await User.findByIdAndUpdate(decoded.userId, {
      $addToSet: { attendedEvents: params.eventId },
    })

    return NextResponse.json({
      message: "Attendance marked successfully",
      timestamp: now,
    })
  } catch (error) {
    console.error("Attendance marking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(authHeader.substring(7))
    if (!decoded || decoded.role !== "organizer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const event = await Event.findById(params.eventId).populate("attendance.userId", "name email department")

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ attendance: event.attendance })
  } catch (error) {
    console.error("Get attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
