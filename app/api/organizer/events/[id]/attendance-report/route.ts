import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// GET /api/organizer/events/[id]/attendance-report - Generate attendance report
export const GET = withRole(["organizer", "admin"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
      }

      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
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

      // Get all registrations for this event
      const eventRegistrations = await registrations.find({
        eventId: id
      }).toArray()

      // Generate report data
      const reportData = {
        event: {
          title: event.title,
          date: event.date,
          venue: event.venue,
          organizerName: event.organizerName
        },
        summary: {
          totalRegistrations: eventRegistrations.length,
          attended: eventRegistrations.filter(r => r.status === 'attended').length,
          registered: eventRegistrations.filter(r => r.status === 'registered').length,
          cancelled: eventRegistrations.filter(r => r.status === 'cancelled').length,
          noShow: eventRegistrations.filter(r => r.status === 'no-show').length
        },
        participants: eventRegistrations.map(reg => ({
          name: reg.userName,
          email: reg.userEmail,
          department: reg.userDepartment,
          status: reg.status,
          registrationDate: reg.registrationDate,
          attendanceTime: reg.attendanceTime
        }))
      }

      // For now, return JSON data. In a real implementation, you'd generate a PDF
      return NextResponse.json(reportData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="attendance-report-${id}.json"`
        }
      })
    } catch (error) {
      console.error("Attendance report error:", error)
      return NextResponse.json({ error: "Failed to generate attendance report" }, { status: 500 })
    }
  }
)
