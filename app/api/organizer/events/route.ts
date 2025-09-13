import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"

// GET /api/organizer/events - Get organizer's events
export const GET = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const { searchParams } = new URL(req.url)
      const limit = parseInt(searchParams.get('limit') || '10')
      const type = searchParams.get('type') // 'pending', 'approved', etc.
      const status = searchParams.get('status')

      const events = await getEventsCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id
      const userEmail = (user as any).email

      // Build query - for now, show all events if user is organizer/admin
      // In production, you'd want to properly link events to organizers
      const query: any = {}
      
      // If user has organizerId, filter by it
      if (userId) {
        query.$or = [
          { organizerId: userId },
          { organizerId: null }, // Include events with null organizerId for now
          { organizerEmail: userEmail } // Also check by email if available
        ]
      }
      
      if (type === 'pending') {
        query.status = 'pending'
      } else if (status) {
        query.status = status
      }

      const organizerEvents = await events
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()

      // Convert ObjectId to string for JSON serialization
      const eventsWithStringIds = organizerEvents.map(event => ({
        ...event,
        _id: event._id.toString()
      }))

      return NextResponse.json({ events: eventsWithStringIds })
    } catch (error) {
      console.error("Organizer events error:", error)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }
  }
)
