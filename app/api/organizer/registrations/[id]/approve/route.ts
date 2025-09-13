import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// POST /api/organizer/registrations/[id]/approve - Approve a registration
export const POST = withRole(["organizer", "admin"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid registration ID" }, { status: 400 })
      }

      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Find the registration
      const registration = await registrations.findOne({ _id: new ObjectId(id) })
      
      if (!registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 })
      }

      // Verify the organizer owns this event
      const event = await events.findOne({ 
        _id: new ObjectId(registration.eventId),
        organizerId: userId 
      })

      if (!event) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      // Update registration status
      await registrations.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "approved", approvedAt: new Date() } }
      )

      return NextResponse.json({ message: "Registration approved successfully" })
    } catch (error) {
      console.error("Approve registration error:", error)
      return NextResponse.json({ error: "Failed to approve registration" }, { status: 500 })
    }
  }
)
