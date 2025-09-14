import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection, getNotificationsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// POST /api/organizer/events/[id]/announcement - Send announcement to event participants
export const POST = withRole(["organizer", "admin"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      const { message } = await req.json()
      
      if (!message || message.trim().length === 0) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 })
      }

      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
      }

      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
      const notifications = await getNotificationsCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Verify the organizer owns this event
      const event = await events.findOne({ 
        _id: new ObjectId(id),
        $or: [
          { organizerId: userId },
          { organizerId: null }, // Allow access to events with null organizerId for now
          { organizerEmail: (user as any).email }
        ]
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 })
      }

      // Get all registered participants for this event
      const eventRegistrations = await registrations.find({
        eventId: id,
        status: { $in: ['registered', 'attended'] }
      }).toArray()

      // Create notifications for all participants
      const notificationPromises = eventRegistrations.map(registration => 
        notifications.insertOne({
          userId: registration.userId,
          eventId: id,
          type: 'announcement',
          title: `Announcement: ${event.title}`,
          message: message,
          isRead: false,
          createdAt: new Date(),
          createdBy: userId
        })
      )

      await Promise.all(notificationPromises)

      return NextResponse.json({ 
        message: "Announcement sent successfully",
        recipients: eventRegistrations.length
      })
    } catch (error) {
      console.error("Send announcement error:", error)
      return NextResponse.json({ error: "Failed to send announcement" }, { status: 500 })
    }
  }
)
