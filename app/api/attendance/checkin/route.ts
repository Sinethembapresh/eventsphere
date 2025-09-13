import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// POST /api/attendance/checkin - Check in to event using QR code
export const POST = withRole(["participant"])(
  async (req: NextRequest, user) => {
    try {
      const { qrData } = await req.json()
      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
      const users = await getUsersCollection()

      if (!qrData) {
        return NextResponse.json({ error: "QR code data is required" }, { status: 400 })
      }

      // Parse QR code data (format: "event:eventId:checkin:timestamp")
      const qrParts = qrData.split(':')
      if (qrParts.length !== 4 || qrParts[0] !== 'event' || qrParts[2] !== 'checkin') {
        return NextResponse.json({ error: "Invalid QR code format" }, { status: 400 })
      }

      const eventId = qrParts[1]
      const qrTimestamp = parseInt(qrParts[3])

      // Validate event ID
      if (!ObjectId.isValid(eventId)) {
        return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
      }

      // Resolve user ID
      const tokenUserId = (user as any).userId || (user as any).id || (user as any)._id
      let dbUser = null as any
      if (tokenUserId && ObjectId.isValid(tokenUserId)) {
        dbUser = await users.findOne({ _id: new ObjectId(tokenUserId) })
      }
      if (!dbUser && (user as any).email) {
        dbUser = await users.findOne({ email: (user as any).email })
      }
      const resolvedUserId: string = dbUser?._id?.toString() || tokenUserId || ""

      if (!resolvedUserId) {
        return NextResponse.json({ error: "Unable to resolve user identity" }, { status: 401 })
      }

      // Check if event exists and is active
      const event = await events.findOne({
        _id: new ObjectId(eventId),
        isActive: true,
        status: "approved"
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found or not available" }, { status: 404 })
      }

      // Check if event is happening now (within 2 hours of start time)
      const eventStartTime = new Date(event.date)
      const now = new Date()
      const timeDiff = Math.abs(now.getTime() - eventStartTime.getTime())
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      if (hoursDiff > 2) {
        return NextResponse.json({ 
          error: "Check-in is only available 2 hours before and after event start time" 
        }, { status: 400 })
      }

      // Check if user is registered for this event
      const registration = await registrations.findOne({
        eventId: eventId,
        userId: resolvedUserId,
        status: "registered"
      })

      if (!registration) {
        return NextResponse.json({ 
          error: "You are not registered for this event" 
        }, { status: 400 })
      }

      // Check if already checked in
      if (registration.status === "attended") {
        return NextResponse.json({ 
          error: "You have already checked in to this event" 
        }, { status: 400 })
      }

      // Update registration status to attended
      await registrations.updateOne(
        { _id: registration._id },
        {
          $set: {
            status: "attended",
            attendanceTime: new Date(),
            qrCodeScanned: true
          }
        }
      )

      // Update event participant count
      await events.updateOne(
        { _id: new ObjectId(eventId) },
        { $inc: { currentParticipants: 1 } }
      )

      return NextResponse.json({ 
        message: "Successfully checked in to event",
        event: {
          title: event.title,
          date: event.date,
          venue: event.venue
        }
      })
    } catch (error) {
      console.error("Check-in error:", error)
      return NextResponse.json({ error: "Failed to check in" }, { status: 500 })
    }
  }
)
