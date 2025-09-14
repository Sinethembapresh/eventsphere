import { type NextRequest, NextResponse } from "next/server"
import { getCertificateTemplatesCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// DELETE /api/organizer/certificate-templates/[id] - Delete certificate template
export const DELETE = withRole(["organizer", "admin"])(
  async (req: NextRequest, user, context: { params: { id: string } }) => {
    try {
      const { id } = context.params
      
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid template ID" }, { status: 400 })
      }

      const templates = await getCertificateTemplatesCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Find the template
      const template = await templates.findOne({ _id: new ObjectId(id) })
      
      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 })
      }

      // Verify the organizer owns this template
      if (template.organizerId !== userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      // Delete the template
      await templates.deleteOne({ _id: new ObjectId(id) })

      return NextResponse.json({ message: "Template deleted successfully" })
    } catch (error) {
      console.error("Delete template error:", error)
      return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
    }
  }
)
