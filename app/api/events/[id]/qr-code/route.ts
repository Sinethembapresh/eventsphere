import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"
import { generateEventQRCodeServer } from "@/lib/server/qr-code"

// GET /api/events/[id]/qr-code - Generate QR code for event check-in
export const GET = withRole(["organizer", "admin"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      
      // Validate event ID
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
      }

      const events = await getEventsCollection()

      // Check if event exists and user has permission
      const event = await events.findOne({
        _id: new ObjectId(id),
        $or: [
          { organizerId: user.userId }, // Event organizer
          { isActive: true } // Admin can access any active event
        ]
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 })
      }

      // Generate QR code data
      const qrData = generateEventQRCodeServer(id)

      return NextResponse.json({
        qrData,
        event: {
          id: event._id,
          title: event.title,
          date: event.date,
          venue: event.venue
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      })
    } catch (error) {
      console.error("QR code generation error:", error)
      return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
    }
  }
)
