import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/middleware"
import { getEventsCollection, getRegistrationsCollection, getFeedbackCollection } from "@/lib/database/collections"

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const events = await getEventsCollection()
    const registrations = await getRegistrationsCollection()
    const feedback = await getFeedbackCollection()

    let stats = {}

    if (user.role === "participant") {
      // Participant stats
      const [registeredEvents, attendedEvents, upcomingEvents, feedbackGiven] = await Promise.all([
        registrations.countDocuments({ userId: user.userId, status: "registered" }),
        registrations.countDocuments({ userId: user.userId, status: "attended" }),
        registrations.countDocuments({
          userId: user.userId,
          status: "registered",
          // Join with events to check date
        }),
        feedback.countDocuments({ userId: user.userId }),
      ])

      // Get upcoming events count
      const userRegistrations = await registrations
        .find({
          userId: user.userId,
          status: "registered",
        })
        .toArray()

      const eventIds = userRegistrations.map((reg) => reg.eventId)
      const upcoming = await events.countDocuments({
        _id: { $in: eventIds.map((id) => id) },
        date: { $gte: new Date() },
        status: "approved",
      })

      stats = {
        registeredEvents,
        attendedEvents,
        upcomingEvents: upcoming,
        feedbackGiven,
        totalEvents: registeredEvents + attendedEvents,
      }
    } else if (user.role === "organizer") {
      // Organizer stats
      const [totalEvents, approvedEvents, pendingEvents, completedEvents, totalRegistrations, averageRating] =
        await Promise.all([
          events.countDocuments({ organizerId: user.userId, isActive: true }),
          events.countDocuments({ organizerId: user.userId, status: "approved", isActive: true }),
          events.countDocuments({ organizerId: user.userId, status: "pending", isActive: true }),
          events.countDocuments({ organizerId: user.userId, status: "completed", isActive: true }),
          registrations.countDocuments({
            eventId: { $in: (await events.find({ organizerId: user.userId }).toArray()).map((e) => e._id?.toString()) },
          }),
          feedback
            .aggregate([
              {
                $lookup: {
                  from: "events",
                  localField: "eventId",
                  foreignField: "_id",
                  as: "event",
                },
              },
              { $unwind: "$event" },
              { $match: { "event.organizerId": user.userId } },
              { $group: { _id: null, avgRating: { $avg: "$rating" } } },
            ])
            .toArray(),
        ])

      stats = {
        totalEvents,
        approvedEvents,
        pendingEvents,
        completedEvents,
        totalRegistrations,
        averageRating: averageRating[0]?.avgRating || 0,
      }
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
})
