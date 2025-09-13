import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getCertificatesCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// GET /api/organizer/certificates - Get certificates for organizer's events
export const GET = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const { searchParams } = new URL(req.url)
      const eventId = searchParams.get('eventId')
      const status = searchParams.get('status')
      const limit = parseInt(searchParams.get('limit') || '50')

      const events = await getEventsCollection()
      const certificates = await getCertificatesCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Get organizer's event IDs
      const organizerEvents = await events.find({
        $or: [
          { organizerId: userId },
          { organizerId: null },
          { organizerEmail: (user as any).email }
        ]
      }).toArray()

      const eventIds = organizerEvents.map(e => e._id.toString())

      // Build query
      const query: any = { 
        eventId: { $in: eventIds }
      }

      if (eventId) {
        query.eventId = eventId
      }

      if (status) {
        query.status = status
      }

      const eventCertificates = await certificates
        .find(query)
        .sort({ issuedAt: -1 })
        .limit(limit)
        .toArray()

      // Convert ObjectId to string for JSON serialization
      const certificatesWithStringIds = eventCertificates.map(cert => ({
        ...cert,
        _id: cert._id.toString()
      }))

      return NextResponse.json({ certificates: certificatesWithStringIds })
    } catch (error) {
      console.error("Get certificates error:", error)
      return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
    }
  }
)

// DELETE /api/organizer/certificates/[id] - Revoke a certificate
export const DELETE = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const { searchParams } = new URL(req.url)
      const certificateId = searchParams.get('id')

      if (!certificateId) {
        return NextResponse.json({ error: "Certificate ID is required" }, { status: 400 })
      }

      const events = await getEventsCollection()
      const certificates = await getCertificatesCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Find the certificate
      const certificate = await certificates.findOne({ _id: new ObjectId(certificateId) })
      
      if (!certificate) {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
      }

      // Verify the organizer owns this event
      const event = await events.findOne({
        _id: new ObjectId(certificate.eventId),
        $or: [
          { organizerId: userId },
          { organizerId: null },
          { organizerEmail: (user as any).email }
        ]
      })

      if (!event) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      // Revoke the certificate
      await certificates.updateOne(
        { _id: new ObjectId(certificateId) },
        { $set: { status: 'revoked', updatedAt: new Date() } }
      )

      return NextResponse.json({ message: "Certificate revoked successfully" })
    } catch (error) {
      console.error("Revoke certificate error:", error)
      return NextResponse.json({ error: "Failed to revoke certificate" }, { status: 500 })
    }
  }
)
