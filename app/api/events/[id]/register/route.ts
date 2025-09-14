import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"
import type { EventRegistration } from "@/lib/models/Event"

// ✅ GET /api/events/[id]/register - Check current user's registration status
export const GET = withRole(["participant"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid event id" }, { status: 400 })
      }

      const registrations = await getRegistrationsCollection()
      const users = await getUsersCollection()

      const tokenUserId = (user as any).userId || (user as any).id || (user as any)._id
      let dbUser = null as any
      if (tokenUserId && ObjectId.isValid(tokenUserId)) {
        dbUser = await users.findOne({ _id: new ObjectId(tokenUserId) })
      }
      if (!dbUser && (user as any).email) {
        dbUser = await users.findOne({ userEmail: (user as any).email })
      }
      const resolvedUserId: string = dbUser?._id?.toString() || tokenUserId || ""
      if (!resolvedUserId) {
        return NextResponse.json({ error: "Unable to resolve user identity" }, { status: 401 })
      }

      const existingRegistration = await registrations.findOne({
        eventId: id,
        userId: resolvedUserId,
        status: "registered",
      })

      return NextResponse.json({ registered: !!existingRegistration })
    } catch (error) {
      console.error("Check registration status error:", error)
      return NextResponse.json({ error: "Failed to check registration status" }, { status: 500 })
    }
  }
)

// ✅ POST /api/events/[id]/register - Register for event
export const POST = withRole(["participant"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      console.log("🔍 Registration attempt for event ID:", id)
      console.log("🔍 User from token:", user)
      
      // Validate event id
      if (!ObjectId.isValid(id)) {
        console.log("❌ Invalid event ID:", id)
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
      console.log("🔍 Token user ID:", tokenUserId)
      
      let dbUser = null as any
      if (tokenUserId && ObjectId.isValid(tokenUserId)) {
        dbUser = await users.findOne({ _id: new ObjectId(tokenUserId) })
        console.log("🔍 Found user by ID:", dbUser ? "Yes" : "No")
      }
      if (!dbUser && (user as any).email) {
        dbUser = await users.findOne({ userEmail: (user as any).email })
        console.log("🔍 Found user by email:", dbUser ? "Yes" : "No")
      }
      
      const resolvedUserId: string = dbUser?._id?.toString() || tokenUserId || ""
      const resolvedUserName: string = dbUser?.userName || (user as any).name || ""
      const resolvedUserEmail: string = dbUser?.userEmail || (user as any).email || ""
      const resolvedDepartment: string = dbUser?.department || (user as any).department || ""
      
      console.log("🔍 Resolved user details:", {
        userId: resolvedUserId,
        userName: resolvedUserName,
        userEmail: resolvedUserEmail,
        department: resolvedDepartment
      })

      if (!resolvedUserId) {
        console.log("❌ Unable to resolve user identity")
        return NextResponse.json({ error: "Unable to resolve user identity" }, { status: 401 })
      }

      // First, let's check if the event exists at all
      const eventExists = await events.findOne({ _id: new ObjectId(id) })
      console.log("🔍 Event exists in database:", eventExists ? "Yes" : "No")
      if (eventExists) {
        console.log("🔍 Event raw data:", {
          _id: eventExists._id,
          title: eventExists.title,
          isActive: eventExists.isActive,
          status: eventExists.status,
          registrationDeadline: eventExists.registrationDeadline
        })
      }

      // Check if event exists and is active
      const event = await events.findOne({
        _id: new ObjectId(id),
        isActive: true,
        status: "approved",
      })
      
      console.log("🔍 Event found:", event ? "Yes" : "No")
      if (event) {
        console.log("🔍 Event details:", {
          title: event.title,
          isActive: event.isActive,
          status: event.status,
          registrationDeadline: event.registrationDeadline,
          maxParticipants: event.maxParticipants,
          currentParticipants: event.currentParticipants
        })
      }

      if (!event) {
        console.log("❌ Event not found or not available for registration")
        return NextResponse.json(
          { error: "Event not found or not available for registration" },
          { status: 404 }
        )
      }

      // Check registration deadline
      if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        console.log("❌ Registration deadline has passed")
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
      
      console.log("🔍 Existing registration:", existingRegistration ? "Yes" : "No")
      if (existingRegistration) {
        console.log("🔍 Registration status:", existingRegistration.status)
      }

      if (existingRegistration) {
        if (existingRegistration.status === "registered") {
          console.log("❌ Already registered for this event")
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
        
        console.log("🔍 Capacity check:", {
          maxParticipants: event.maxParticipants,
          currentRegistrations: currentRegistrations
        })

        if (currentRegistrations >= event.maxParticipants) {
          console.log("❌ Event is full")
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

      console.log("✅ Registration successful")
      return NextResponse.json({ message: "Successfully registered for event" })
    } catch (error) {
      console.error("❌ Event registration error:", error)
      console.error("❌ Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      })
      return NextResponse.json(
        { error: "Failed to register for event" },
        { status: 500 }
      )
    }
  }
)

// ✅ DELETE /api/events/[id]/register - Cancel registration
export const DELETE = withRole(["participant"])(
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
        dbUser = await users.findOne({ userEmail: (user as any).email })
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
