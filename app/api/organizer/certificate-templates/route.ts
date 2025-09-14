import { type NextRequest, NextResponse } from "next/server"
import { getCertificateTemplatesCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"
import type { CertificateTemplate } from "@/lib/models/Certificate"

// GET /api/organizer/certificate-templates - Get certificate templates
export const GET = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const { searchParams } = new URL(req.url)
      const eventId = searchParams.get('eventId')
      const limit = parseInt(searchParams.get('limit') || '20')

      const templates = await getCertificateTemplatesCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Build query
      const query: any = { organizerId: userId }
      if (eventId) {
        query.$or = [
          { eventId: eventId },
          { eventId: null }, // Global templates
          { eventId: { $exists: false } }
        ]
      }

      const certificateTemplates = await templates
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()

      // Convert ObjectId to string for JSON serialization
      const templatesWithStringIds = certificateTemplates.map(template => ({
        ...template,
        _id: template._id.toString()
      }))

      return NextResponse.json({ templates: templatesWithStringIds })
    } catch (error) {
      console.error("Get certificate templates error:", error)
      return NextResponse.json({ error: "Failed to fetch certificate templates" }, { status: 500 })
    }
  }
)

// POST /api/organizer/certificate-templates - Create certificate template
export const POST = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const formData = await req.formData()
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const eventId = formData.get('eventId') as string
      const file = formData.get('file') as File

      if (!name || !file) {
        return NextResponse.json({ error: "Name and file are required" }, { status: 400 })
      }

      const templates = await getCertificateTemplatesCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id
      const userName = (user as any).name || "Unknown Organizer"

      // In a real implementation, you would upload the file to cloud storage
      // For now, we'll store the metadata
      const template: Omit<CertificateTemplate, "_id"> = {
        name: name.trim(),
        description: description?.trim() || "",
        templateUrl: `/uploads/certificates/${file.name}`, // Placeholder URL
        eventId: eventId || undefined,
        organizerId: userId,
        organizerName: userName,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = await templates.insertOne(template as any)

      return NextResponse.json({
        message: "Certificate template created successfully",
        template: {
          ...template,
          _id: result.insertedId.toString()
        }
      }, { status: 201 })
    } catch (error) {
      console.error("Create certificate template error:", error)
      return NextResponse.json({ error: "Failed to create certificate template" }, { status: 500 })
    }
  }
)
