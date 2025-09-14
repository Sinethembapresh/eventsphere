import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// GET /api/organizer/dashboard/stats - Get organizer dashboard statistics
export const GET = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
      const users = await getUsersCollection()

      const userId = (user as any).userId || (user as any).id || (user as any)._id
      const userEmail = (user as any).email

      // Get organizer's events - include events with null organizerId for now
      const organizerEvents = await events.find({
        $or: [
          { organizerId: userId },
          { organizerId: null }, // Include events with null organizerId for now
          { organizerEmail: userEmail } // Also check by email if available
        ]
      }).toArray()

      // Calculate stats
      const totalEvents = organizerEvents.length
      const approvedEvents = organizerEvents.filter(e => e.status === 'approved').length
      const pendingEvents = organizerEvents.filter(e => e.status === 'pending').length
      const completedEvents = organizerEvents.filter(e => e.status === 'completed').length

      // Get all event IDs for this organizer
      const eventIds = organizerEvents.map(e => e._id.toString())

      // Get registrations for organizer's events
      const eventRegistrations = await registrations.find({
        eventId: { $in: eventIds },
        status: { $in: ['registered', 'attended'] }
      }).toArray()

      const totalRegistrations = eventRegistrations.length
      const totalAttendees = eventRegistrations.filter(r => r.status === 'attended').length
      const pendingRegistrations = eventRegistrations.filter(r => r.status === 'registered').length

      // Calculate average rating (placeholder - would need feedback collection)
      const averageRating = 4.5 // This would be calculated from actual feedback data

      // Count certificates issued (placeholder - would need certificates collection)
      const certificatesIssued = totalAttendees // Assuming all attendees get certificates

      return NextResponse.json({
        totalEvents,
        approvedEvents,
        pendingEvents,
        completedEvents,
        totalRegistrations,
        totalAttendees,
        averageRating,
        pendingRegistrations,
        certificatesIssued
      })
    } catch (error) {
      console.error("Organizer dashboard stats error:", error)
      return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
    }
  }
)
