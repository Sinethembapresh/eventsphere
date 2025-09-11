import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/auth/middleware"
import { getEventsCollection, getNotificationsCollection } from "@/lib/database/collections"
import { ObjectId } from "mongodb"
import type { Notification } from "@/lib/models/Notification"

// POST /api/admin/events/[id]/reject - Reject event
export const POST = withRole(["admin"])(async (req: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const { reason } = await req.json()
    const events = await getEventsCollection()
    const notifications = await getNotificationsCollection()

    const event = await events.findOne({ _id: new ObjectId(params.id) })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Update event status
    await events.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: "rejected",
          updatedAt: new Date(),
        },
      },
    )

    // Send notification to organizer
    const notification: Notification = {
      userId: event.organizerId,
      type: "event_update",
      title: "Event Rejected",
      message: reason || `Your event "${event.title}" has been rejected. Please review and resubmit.`,
      eventId: params.id,
      isRead: false,
      priority: "high",
      createdAt: new Date(),
    }

    await notifications.insertOne(notification)

    return NextResponse.json({ message: "Event rejected successfully" })
  } catch (error) {
    console.error("Reject event error:", error)
    return NextResponse.json({ error: "Failed to reject event" }, { status: 500 })
  }
})
