import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getRegistrationsCollection, getCertificatesCollection, getCertificateTemplatesCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"
import type { Certificate } from "@/lib/models/Certificate"

// POST /api/organizer/certificates/issue - Issue certificates to eligible participants
export const POST = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const { eventId, templateId, participantIds, criteria } = await req.json()

      if (!eventId || !templateId) {
        return NextResponse.json({ error: "Event ID and template ID are required" }, { status: 400 })
      }

      const events = await getEventsCollection()
      const registrations = await getRegistrationsCollection()
      const certificates = await getCertificatesCollection()
      const templates = await getCertificateTemplatesCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id
      const userName = (user as any).name || "Unknown Organizer"

      // Verify the organizer owns this event
      const event = await events.findOne({
        _id: new ObjectId(eventId),
        $or: [
          { organizerId: userId },
          { organizerId: null },
          { organizerEmail: (user as any).email }
        ]
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 })
      }

      // Get the template
      const template = await templates.findOne({
        _id: new ObjectId(templateId),
        organizerId: userId
      })

      if (!template) {
        return NextResponse.json({ error: "Certificate template not found" }, { status: 404 })
      }

      // Get eligible participants
      let eligibleParticipants = []
      
      if (participantIds && participantIds.length > 0) {
        // Issue certificates to specific participants
        eligibleParticipants = await registrations.find({
          _id: { $in: participantIds.map((id: string) => new ObjectId(id)) },
          eventId: eventId,
          status: { $in: ['attended', 'registered'] }
        }).toArray()
      } else {
        // Issue certificates based on criteria
        const query: any = {
          eventId: eventId,
          status: { $in: ['attended', 'registered'] }
        }

        if (criteria?.attendanceRequired) {
          query.status = 'attended'
        }

        if (criteria?.paymentRequired) {
          // Add payment status check if you have payment tracking
          query.paymentStatus = 'paid'
        }

        eligibleParticipants = await registrations.find(query).toArray()
      }

      if (eligibleParticipants.length === 0) {
        return NextResponse.json({ error: "No eligible participants found" }, { status: 400 })
      }

      // Generate certificates
      const certificatesToCreate: Omit<Certificate, "_id">[] = []
      const issuedCertificates = []

      for (const participant of eligibleParticipants) {
        // Check if certificate already exists
        const existingCertificate = await certificates.findOne({
          eventId: eventId,
          participantId: participant.userId
        })

        if (existingCertificate) {
          continue // Skip if certificate already exists
        }

        const certificateId = `CERT-${eventId}-${participant.userId}-${Date.now()}`
        const verificationCode = generateVerificationCode()

        const certificate: Omit<Certificate, "_id"> = {
          certificateId,
          eventId: eventId,
          eventTitle: event.title,
          participantId: participant.userId,
          participantName: participant.userName,
          participantEmail: participant.userEmail,
          participantDepartment: participant.userDepartment,
          templateId: templateId,
          templateUrl: template.templateUrl,
          issuedAt: new Date(),
          issuedBy: userId,
          issuedByName: userName,
          status: 'issued',
          downloadCount: 0,
          verificationCode,
          metadata: {
            eventDate: event.date,
            eventVenue: event.venue,
            eventCategory: event.category,
            participantRole: participant.role || 'Participant',
            customFields: {
              organizerName: event.organizerName,
              eventDescription: event.description
            }
          }
        }

        certificatesToCreate.push(certificate)
        issuedCertificates.push(certificate)
      }

      // Insert all certificates
      if (certificatesToCreate.length > 0) {
        await certificates.insertMany(certificatesToCreate as any)
      }

      return NextResponse.json({
        message: `Successfully issued ${issuedCertificates.length} certificates`,
        certificates: issuedCertificates.map(cert => ({
          ...cert,
          _id: cert._id?.toString()
        })),
        event: {
          id: event._id.toString(),
          title: event.title,
          date: event.date
        }
      })
    } catch (error) {
      console.error("Issue certificates error:", error)
      return NextResponse.json({ error: "Failed to issue certificates" }, { status: 500 })
    }
  }
)

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
