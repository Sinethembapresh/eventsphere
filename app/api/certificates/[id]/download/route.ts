import { type NextRequest, NextResponse } from "next/server"
import { getCertificatesCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// GET /api/certificates/[id]/download - Download certificate
export const GET = withRole(["participant", "organizer", "admin"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid certificate ID" }, { status: 400 })
      }

      const certificates = await getCertificatesCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id
      const userRole = (user as any).role

      // Find the certificate
      const certificate = await certificates.findOne({ _id: new ObjectId(id) })
      
      if (!certificate) {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
      }

      // Check permissions
      const hasPermission = userRole === "admin" || 
                           userRole === "organizer" || 
                           certificate.participantId === userId

      if (!hasPermission) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      // Check if certificate is revoked
      if (certificate.status === 'revoked') {
        return NextResponse.json({ error: "Certificate has been revoked" }, { status: 410 })
      }

      // Update download count and last downloaded time
      await certificates.updateOne(
        { _id: new ObjectId(id) },
        { 
          $inc: { downloadCount: 1 },
          $set: { 
            lastDownloadedAt: new Date(),
            status: 'downloaded'
          }
        }
      )

      // In a real implementation, you would generate a PDF certificate
      // For now, we'll return the certificate data and template URL
      const certificateData = {
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        eventTitle: certificate.eventTitle,
        eventDate: certificate.metadata?.eventDate,
        eventVenue: certificate.metadata?.eventVenue,
        issuedAt: certificate.issuedAt,
        issuedBy: certificate.issuedByName,
        verificationCode: certificate.verificationCode,
        templateUrl: certificate.templateUrl
      }

      // Return certificate data as JSON (in production, this would be a PDF)
      return NextResponse.json({
        message: "Certificate download initiated",
        certificate: certificateData,
        downloadUrl: certificate.templateUrl // This would be the actual PDF URL
      })
    } catch (error) {
      console.error("Download certificate error:", error)
      return NextResponse.json({ error: "Failed to download certificate" }, { status: 500 })
    }
  }
)
