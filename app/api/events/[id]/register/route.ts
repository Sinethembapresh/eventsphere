import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"
import type { EventRegistration } from "@/lib/models/Event"

// POST /api/events/[id]/register - Register for event
export const POST = withRole(["participant"])(
  async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()

      // Check if event exists and is active
      const event = await events.findOne({
        _id: new ObjectId(params.id),
        isActive: true,
        status: "approved",
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found or not available for registration" }, { status: 404 })
      }

      // Check registration deadline
      if (new Date() > new Date(event.registrationDeadline)) {
        return NextResponse.json({ error: "Registration deadline has passed" }, { status: 400 })
      }

      // Check if already registered
      const existingRegistration = await registrations.findOne({
        eventId: params.id,
        userId: user.userId,
      })

      if (existingRegistration) {
        if (existingRegistration.status === "registered") {
          return NextResponse.json({ error: "Already registered for this event" }, { status: 400 })
        }

        // Reactivate cancelled registration
        await registrations.updateOne(
          { _id: existingRegistration._id },
          {
            $set: {
              status: "registered",
              registrationDate: new Date(),
            },
          },
        )

        return NextResponse.json({ message: "Successfully registered for event" })
      }

      // Check capacity
      if (event.maxParticipants) {
        const currentRegistrations = await registrations.countDocuments({
          eventId: params.id,
          status: "registered",
        })

        if (currentRegistrations >= event.maxParticipants) {
          return NextResponse.json({ error: "Event is full" }, { status: 400 })
        }
      }

      // Create new registration
      const registration: EventRegistration = {
        eventId: params.id,
        userId: user.userId,
        userName: user.name,
        userEmail: user.email,
        userDepartment: user.department || "",
        registrationDate: new Date(),
        status: "registered",
      }

      await registrations.insertOne(registration)

      // Update event participant count
      await events.updateOne({ _id: new ObjectId(params.id) }, { $inc: { currentParticipants: 1 } })

      return NextResponse.json({ message: "Successfully registered for event" })
    } catch (error) {
      console.error("Event registration error:", error)
      return NextResponse.json({ error: "Failed to register for event" }, { status: 500 })
    }
  },
)

// DELETE /api/events/[id]/register - Cancel registration
export const DELETE = withRole(["participant"])(
  async (req: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()

      // Check if registered
      const registration = await registrations.findOne({
        eventId: params.id,
        userId: user.userId,
        status: "registered",
      })

      if (!registration) {
        return NextResponse.json({ error: "Not registered for this event" }, { status: 400 })
      }

      // Check if event allows cancellation (e.g., not too close to event date)
      const event = await events.findOne({ _id: new ObjectId(params.id) })
      if (event) {
        const hoursUntilEvent = (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60)
        if (hoursUntilEvent < 24) {
          return NextResponse.json(
            { error: "Cannot cancel registration less than 24 hours before event" },
            { status: 400 },
          )
        }
      }

      // Cancel registration
      await registrations.updateOne({ _id: registration._id }, { $set: { status: "cancelled" } })

      // Update event participant count
      await events.updateOne({ _id: new ObjectId(params.id) }, { $inc: { currentParticipants: -1 } })

      return NextResponse.json({ message: "Registration cancelled successfully" })
    } catch (error) {
      console.error("Cancel registration error:", error)
      return NextResponse.json({ error: "Failed to cancel registration" }, { status: 500 })
    }
  },
)
