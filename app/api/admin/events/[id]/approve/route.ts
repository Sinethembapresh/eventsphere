import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/auth/middleware"
import { getEventsCollection, getNotificationsCollection } from "@/lib/database/collections"
import { ObjectId } from "mongodb"
import type { Notification } from "@/lib/models/Notification"

// POST /api/admin/events/[id]/approve - Approve event
export const POST = withRole(["admin"])(async (req: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const { message } = await req.json()
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
          status: "approved",
          updatedAt: new Date(),
        },
      },
    )

    // Send notification to organizer
    const notification: Notification = {
      userId: event.organizerId,
      type: "event_update",
      title: "Event Approved",
      message: message || `Your event "${event.title}" has been approved and is now live.`,
      eventId: params.id,
      isRead: false,
      priority: "medium",
      createdAt: new Date(),
    }

    await notifications.insertOne(notification)

    return NextResponse.json({ message: "Event approved successfully" })
  } catch (error) {
    console.error("Approve event error:", error)
    return NextResponse.json({ error: "Failed to approve event" }, { status: 500 })
  }
})
