import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"
import type { EventRegistration } from "@/lib/models/Event"

// ✅ POST /api/events/[id]/register - Register for event
export const POST = withRole(["participant", "student"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      // Validate event id
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid event id" },
          { status: 400 }
        )
      }
      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
      const users = await getUsersCollection()

      // Resolve full user details from DB to avoid null user fields from token
      const tokenUserId = (user as any).userId || (user as any).id || (user as any)._id
      let dbUser = null as any
      if (tokenUserId && ObjectId.isValid(tokenUserId)) {
        dbUser = await users.findOne({ _id: new ObjectId(tokenUserId) })
      }
      if (!dbUser && (user as any).email) {
        dbUser = await users.findOne({ email: (user as any).email })
      }
      const resolvedUserId: string = dbUser?._id?.toString() || tokenUserId || ""
      const resolvedUserName: string = dbUser?.name || (user as any).name || ""
      const resolvedUserEmail: string = dbUser?.email || (user as any).email || ""
      const resolvedDepartment: string = dbUser?.department || (user as any).department || ""

      if (!resolvedUserId) {
        return NextResponse.json({ error: "Unable to resolve user identity" }, { status: 401 })
      }

      // Check if event exists and is active
      const event = await events.findOne({
        _id: new ObjectId(id),
        isActive: true,
        status: "approved",
      })

      if (!event) {
        return NextResponse.json(
          { error: "Event not found or not available for registration" },
          { status: 404 }
        )
      }

      // Check registration deadline
      if (new Date() > new Date(event.registrationDeadline)) {
        return NextResponse.json(
          { error: "Registration deadline has passed" },
          { status: 400 }
        )
      }

      // Check if already registered
      const existingRegistration = await registrations.findOne({
        eventId: id,
        userId: resolvedUserId,
      })

      if (existingRegistration) {
        if (existingRegistration.status === "registered") {
          return NextResponse.json(
            { error: "Already registered for this event" },
            { status: 400 }
          )
        }

        // Reactivate cancelled registration
        await registrations.updateOne(
          { _id: existingRegistration._id },
          {
            $set: {
              status: "registered",
              registrationDate: new Date(),
            },
          }
        )

        return NextResponse.json({ message: "Successfully registered for event" })
      }

      // Check capacity
      if (event.maxParticipants) {
        const currentRegistrations = await registrations.countDocuments({
          eventId: id,
          status: "registered",
        })

        if (currentRegistrations >= event.maxParticipants) {
          return NextResponse.json({ error: "Event is full" }, { status: 400 })
        }
      }

      // Create new registration
      // Build registration document (omit string _id to satisfy Mongo types)
      const registration: Omit<EventRegistration, "_id"> = {
        eventId: id,
        userId: resolvedUserId,
        userName: resolvedUserName,
        userEmail: resolvedUserEmail,
        userDepartment: resolvedDepartment,
        registrationDate: new Date(),
        status: "registered",
      }

      await registrations.insertOne(registration as any)

      // Update event participant count
      await events.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { currentParticipants: 1 } }
      )

      return NextResponse.json({ message: "Successfully registered for event" })
    } catch (error) {
      console.error("Event registration error:", error)
      return NextResponse.json(
        { error: "Failed to register for event" },
        { status: 500 }
      )
    }
  }
)

// ✅ DELETE /api/events/[id]/register - Cancel registration
export const DELETE = withRole(["participant", "student"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      // Validate event id
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid event id" },
          { status: 400 }
        )
      }
      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
      const users = await getUsersCollection()

      // Resolve user id similarly to POST
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

      // Check if registered
      const registration = await registrations.findOne({
        eventId: id,
        userId: resolvedUserId,
        status: "registered",
      })

      if (!registration) {
        return NextResponse.json(
          { error: "Not registered for this event" },
          { status: 400 }
        )
      }

      // Check if event allows cancellation
      const event = await events.findOne({ _id: new ObjectId(id) })
      if (event) {
        const hoursUntilEvent =
          (new Date(event.date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60)

        if (hoursUntilEvent < 24) {
          return NextResponse.json(
            { error: "Cannot cancel registration less than 24 hours before event" },
            { status: 400 }
          )
        }
      }

      // Cancel registration
      await registrations.updateOne(
        { _id: registration._id },
        { $set: { status: "cancelled" } }
      )

      // Update event participant count
      await events.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { currentParticipants: -1 } }
      )

      return NextResponse.json({ message: "Registration cancelled successfully" })
    } catch (error) {
      console.error("Cancel registration error:", error)
      return NextResponse.json(
        { error: "Failed to cancel registration" },
        { status: 500 }
      )
    }
  }
)
