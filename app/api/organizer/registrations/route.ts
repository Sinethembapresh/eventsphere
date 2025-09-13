import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"

// GET /api/organizer/registrations - Get registrations for organizer's events
export const GET = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const { searchParams } = new URL(req.url)
      const eventId = searchParams.get('eventId')
      const status = searchParams.get('status')
      const limit = parseInt(searchParams.get('limit') || '50')

      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Get organizer's event IDs
      const organizerEvents = await events.find({
        organizerId: userId
      }).toArray()

      const eventIds = organizerEvents.map(e => e._id.toString())

      // Build query
      const query: any = { 
        eventId: { $in: eventIds }
      }

      if (eventId) {
        query.eventId = eventId
      }

      if (status) {
        query.status = status
      }

      const eventRegistrations = await registrations
        .find(query)
        .sort({ registrationDate: -1 })
        .limit(limit)
        .toArray()

      // Convert ObjectId to string for JSON serialization
      const registrationsWithStringIds = eventRegistrations.map(registration => ({
        ...registration,
        _id: registration._id.toString()
      }))

      return NextResponse.json({ registrations: registrationsWithStringIds })
    } catch (error) {
      console.error("Organizer registrations error:", error)
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
    }
  }
)
