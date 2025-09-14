import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection } from "@/lib/database/collections"
import { withAuth } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// GET /api/events/[id] - Get single event
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const events = await getEventsCollection()
    const registrations = await getRegistrationsCollection()

    const event = await events.findOne({
      _id: new ObjectId(params.id),
      isActive: true,
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Get registration count
    const registrationCount = await registrations.countDocuments({
      eventId: params.id,
      status: "registered",
    })

    return NextResponse.json({
      ...event,
      currentParticipants: registrationCount,
    })
  } catch (error) {
    console.error("Get event error:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PUT /api/events/[id] - Update event (organizer/admin only)
export const PUT = withAuth(async (req: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const events = await getEventsCollection()
    const updateData = await req.json()

    // Check if user owns the event or is admin
    const event = await events.findOne({ _id: new ObjectId(params.id) })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Debug logging
    console.log("Event update request:", {
      eventId: params.id,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        name: user.name
      },
      event: {
        organizerId: event.organizerId,
        organizerEmail: event.organizerEmail
      }
    })

    // Allow access if user is admin, owns the event, or event has no organizer (null)
    const hasPermission = user.role === "admin" || 
                         event.organizerId === user.userId || 
                         event.organizerId === null ||
                         event.organizerEmail === user.email

    console.log("Permission check:", {
      isAdmin: user.role === "admin",
      isOwner: event.organizerId === user.userId,
      hasNullOrganizer: event.organizerId === null,
      emailMatch: event.organizerEmail === user.email,
      hasPermission
    })

    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Validate update data
    if (updateData.date) {
      const eventDate = new Date(updateData.date)
      if (eventDate <= new Date()) {
        return NextResponse.json({ error: "Event date must be in the future" }, { status: 400 })
      }
    }

    // If event has no organizer and user is updating it, set them as organizer
    const updateFields: any = {
      ...updateData,
      updatedAt: new Date(),
    }

    if (event.organizerId === null) {
      updateFields.organizerId = user.userId
      updateFields.organizerName = user.name || "Unknown Organizer"
      updateFields.organizerEmail = user.email
    }

    const result = await events.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: updateFields,
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Event updated successfully" })
  } catch (error) {
    console.error("Update event error:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
})

// DELETE /api/events/[id] - Delete event (organizer/admin only)
export const DELETE = withAuth(async (req: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const events = await getEventsCollection()

    // Check if user owns the event or is admin
    const event = await events.findOne({ _id: new ObjectId(params.id) })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Allow access if user is admin, owns the event, or event has no organizer (null)
    const hasPermission = user.role === "admin" || 
                         event.organizerId === user.userId || 
                         event.organizerId === null ||
                         event.organizerEmail === user.email

    if (!hasPermission) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Soft delete
    await events.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
})
