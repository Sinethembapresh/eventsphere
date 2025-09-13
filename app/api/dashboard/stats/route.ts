import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// GET /api/dashboard/stats - Get participant dashboard statistics
export const GET = withRole(["participant"])(
  async (req: NextRequest, user) => {
    try {
      const registrations = await getRegistrationsCollection()
      const events = await getEventsCollection()
      const users = await getUsersCollection()

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

      // Get total registrations
      const totalRegistrations = await registrations.countDocuments({
        userId: resolvedUserId,
        status: { $in: ["registered", "attended"] }
      })

      // Get upcoming events (registered for)
      const upcomingRegistrations = await registrations.find({
        userId: resolvedUserId,
        status: "registered"
      }).toArray()

      const upcomingEventIds = upcomingRegistrations.map(reg => reg.eventId)
      const upcomingEvents = await events.countDocuments({
        _id: { $in: upcomingEventIds.map(id => new ObjectId(id)) },
        date: { $gte: new Date() },
        status: "approved"
      })

      // Get certificates earned (attended events)
      const certificatesEarned = await registrations.countDocuments({
        userId: resolvedUserId,
        status: "attended"
      })

      // Get events attended
      const eventsAttended = await registrations.countDocuments({
        userId: resolvedUserId,
        status: "attended"
      })

      return NextResponse.json({
        totalRegistrations,
        upcomingEvents,
        certificatesEarned,
        eventsAttended
      })
    } catch (error) {
      console.error("Dashboard stats error:", error)
      return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
    }
  }
)