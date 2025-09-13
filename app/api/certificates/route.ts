import { type NextRequest, NextResponse } from "next/server"
import { getCertificatesCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"

// GET /api/certificates - Get participant's certificates
export const GET = withRole(["participant", "organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const { searchParams } = new URL(req.url)
      const eventId = searchParams.get('eventId')
      const status = searchParams.get('status')
      const limit = parseInt(searchParams.get('limit') || '20')

      const certificates = await getCertificatesCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Build query
      const query: any = { participantId: userId }

      if (eventId) {
        query.eventId = eventId
      }

      if (status) {
        query.status = status
      }

      const participantCertificates = await certificates
        .find(query)
        .sort({ issuedAt: -1 })
        .limit(limit)
        .toArray()

      // Convert ObjectId to string for JSON serialization
      const certificatesWithStringIds = participantCertificates.map(cert => ({
        ...cert,
        _id: cert._id.toString()
      }))

      return NextResponse.json({ certificates: certificatesWithStringIds })
    } catch (error) {
      console.error("Get participant certificates error:", error)
      return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
    }
  }
)
