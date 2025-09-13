import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection, getMediaCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// GET /api/organizer/media - Get media for organizer's events
export const GET = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const { searchParams } = new URL(req.url)
      const eventId = searchParams.get('eventId')
      const type = searchParams.get('type') // 'image', 'video'
      const limit = parseInt(searchParams.get('limit') || '20')

      const events = await getEventsCollection()
      const media = await getMediaCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Get organizer's event IDs
      const organizerEvents = await events.find({
        organizerId: userId
      }).toArray()

      const eventIds = organizerEvents.map(e => e._id.toString())

      // Build query
      const query: any = { 
        eventId: { $in: eventIds }
      }

      if (eventId) {
        query.eventId = eventId
      }

      if (type) {
        query.type = type
      }

      const mediaItems = await media
        .find(query)
        .sort({ uploadedAt: -1 })
        .limit(limit)
        .toArray()

      // Convert ObjectId to string for JSON serialization
      const mediaWithStringIds = mediaItems.map(item => ({
        ...item,
        _id: item._id.toString()
      }))

      return NextResponse.json({ media: mediaWithStringIds })
    } catch (error) {
      console.error("Organizer media error:", error)
      return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
    }
  }
)

// POST /api/organizer/media - Upload media for organizer's events
export const POST = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const formData = await req.formData()
      const eventId = formData.get('eventId') as string
      const type = formData.get('type') as string
      const caption = formData.get('caption') as string
      const file = formData.get('file') as File

      if (!eventId || !type || !file) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const events = await getEventsCollection()
      const media = await getMediaCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Verify the organizer owns this event
      const event = await events.findOne({ 
        _id: new ObjectId(eventId),
        organizerId: userId 
      })

      if (!event) {
        return NextResponse.json({ error: "Event not found or access denied" }, { status: 404 })
      }

      // In a real implementation, you would upload the file to a cloud storage service
      // For now, we'll just store the metadata
      const mediaItem = {
        eventId,
        type,
        caption: caption || '',
        url: `/uploads/${file.name}`, // Placeholder URL
        uploadedAt: new Date(),
        uploadedBy: userId,
        fileSize: file.size,
        fileName: file.name
      }

      await media.insertOne(mediaItem)

      return NextResponse.json({ 
        message: "Media uploaded successfully",
        media: {
          ...mediaItem,
          _id: mediaItem._id?.toString()
        }
      })
    } catch (error) {
      console.error("Upload media error:", error)
      return NextResponse.json({ error: "Failed to upload media" }, { status: 500 })
    }
  }
)
