import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/middleware"
import { getEventsCollection, getRegistrationsCollection } from "@/lib/database/collections"
import { ObjectId } from "mongodb"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "all" // all, upcoming, past, registered
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const events = await getEventsCollection()
    const registrations = await getRegistrationsCollection()

    let userEvents = []

    if (user.role === "participant") {
      // Get events user is registered for
      const userRegistrations = await registrations
        .find({
          userId: user.userId,
          status: { $in: ["registered", "attended"] },
        })
        .toArray()

      const eventIds = userRegistrations.map((reg) => new ObjectId(reg.eventId))

      const filter: any = {
        _id: { $in: eventIds },
        isActive: true,
      }

      if (type === "upcoming") {
        filter.date = { $gte: new Date() }
        filter.status = "approved"
      } else if (type === "past") {
        filter.date = { $lt: new Date() }
      }

      userEvents = await events
        .find(filter)
        .sort({ date: type === "past" ? -1 : 1 })
        .limit(limit)
        .toArray()

      // Add registration info
      userEvents = userEvents.map((event) => {
        const registration = userRegistrations.find((reg) => reg.eventId === event._id?.toString())
        return {
          ...event,
          registrationStatus: registration?.status,
          registrationDate: registration?.registrationDate,
        }
      })
    } else if (user.role === "organizer") {
      // Get events created by organizer
      const filter: any = {
        organizerId: user.userId,
        isActive: true,
      }

      if (type === "upcoming") {
        filter.date = { $gte: new Date() }
      } else if (type === "past") {
        filter.date = { $lt: new Date() }
      } else if (type === "pending") {
        filter.status = "pending"
      }

      userEvents = await events.find(filter).sort({ createdAt: -1 }).limit(limit).toArray()

      // Add registration counts
      for (const event of userEvents) {
        const registrationCount = await registrations.countDocuments({
          eventId: event._id?.toString(),
          status: "registered",
        })
        event.currentParticipants = registrationCount
      }
    }

    return NextResponse.json({ events: userEvents })
  } catch (error) {
    console.error("Dashboard events error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard events" }, { status: 500 })
  }
})
