import { type NextRequest, NextResponse } from "next/server"
import { getCertificatesCollection, getCertificateVerificationsCollection } from "@/lib/database/collections"
import { ObjectId } from "mongodb"

// GET /api/certificates/verify - Verify certificate by ID or verification code
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const certificateId = searchParams.get('id')
    const verificationCode = searchParams.get('code')

    if (!certificateId && !verificationCode) {
      return NextResponse.json({ error: "Certificate ID or verification code is required" }, { status: 400 })
    }

    const certificates = await getCertificatesCollection()
    const verifications = await getCertificateVerificationsCollection()

    // Find the certificate
    const query: any = {}
    if (certificateId) {
      query.certificateId = certificateId
    } else if (verificationCode) {
      query.verificationCode = verificationCode
    }

    const certificate = await certificates.findOne(query)
    
    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    // Check if certificate is revoked
    if (certificate.status === 'revoked') {
      return NextResponse.json({ 
        error: "Certificate has been revoked",
        certificate: {
          certificateId: certificate.certificateId,
          status: certificate.status,
          revoked: true
        }
      }, { status: 410 })
    }

    // Record verification
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await verifications.insertOne({
      certificateId: certificate.certificateId,
      participantId: certificate.participantId,
      eventId: certificate.eventId,
      verifiedAt: new Date(),
      ipAddress: clientIP,
      userAgent: userAgent
    })

    // Return certificate verification data
    const verificationData = {
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        eventTitle: certificate.eventTitle,
        eventDate: certificate.metadata?.eventDate,
        eventVenue: certificate.metadata?.eventVenue,
        issuedAt: certificate.issuedAt,
        issuedBy: certificate.issuedByName,
        status: certificate.status,
        downloadCount: certificate.downloadCount
      }
    }

    return NextResponse.json(verificationData)
  } catch (error) {
    console.error("Verify certificate error:", error)
    return NextResponse.json({ error: "Failed to verify certificate" }, { status: 500 })
  }
}
