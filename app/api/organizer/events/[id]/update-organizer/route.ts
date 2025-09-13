import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// POST /api/organizer/events/[id]/update-organizer - Update organizer information for an event
export const POST = withRole(["organizer", "admin"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
      }

      const events = await getEventsCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id
      const userName = (user as any).name || (user as any).userName || "Unknown Organizer"
      const userEmail = (user as any).email

      // Find the event
      const event = await events.findOne({ _id: new ObjectId(id) })
      
      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      // Update the event with organizer information
      await events.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            organizerId: userId,
            organizerName: userName,
            organizerEmail: userEmail,
            updatedAt: new Date()
          }
        }
      )

      return NextResponse.json({ 
        message: "Event organizer information updated successfully",
        event: {
          id: id,
          organizerId: userId,
          organizerName: userName,
          organizerEmail: userEmail
        }
      })
    } catch (error) {
      console.error("Update organizer error:", error)
      return NextResponse.json({ error: "Failed to update organizer information" }, { status: 500 })
    }
  }
)
