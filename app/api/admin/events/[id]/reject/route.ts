import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/auth/middleware"
import { getEventsCollection, getNotificationsCollection } from "@/lib/database/collections"
import { ObjectId } from "mongodb"
import type { Notification } from "@/lib/models/Notification"

// POST /api/admin/events/[id]/reject - Reject event
export const POST = withRole(["admin"])(async (req: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 })
    }

    let body: any = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const { reason } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    const events = await getEventsCollection()
    const notifications = await getNotificationsCollection()

    const event = await events.findOne({ _id: new ObjectId(params.id) })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Update event status
    const updateResult = await events.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: "rejected",
          updatedAt: new Date(),
        },
      },
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

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

    await notifications.insertOne(notification as any)

    return NextResponse.json({ message: "Event rejected successfully" })
  } catch (error) {
    console.error("Reject event error:", error)
    return NextResponse.json({ error: "Failed to reject event" }, { status: 500 })
  }
})
