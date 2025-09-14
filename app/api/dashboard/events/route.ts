import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// GET /api/dashboard/events - Get participant's upcoming events
export const GET = withRole(["participant"])(
  async (req: NextRequest, user) => {
    try {
      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
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

      // Get user's registered events
      const userRegistrations = await registrations.find({
        userId: resolvedUserId,
        status: "registered"
      }).toArray()

      const eventIds = userRegistrations.map(reg => reg.eventId)
      
      if (eventIds.length === 0) {
        return NextResponse.json({ events: [] })
      }

      // Get upcoming events
      const upcomingEvents = await events.find({
        _id: { $in: eventIds.map(id => new ObjectId(id)) },
        date: { $gte: new Date() },
        status: "approved",
        isActive: true
      }).sort({ date: 1 }).limit(10).toArray()

      return NextResponse.json({ events: upcomingEvents })
    } catch (error) {
      console.error("Dashboard events error:", error)
      return NextResponse.json({ error: "Failed to fetch dashboard events" }, { status: 500 })
    }
  }
)