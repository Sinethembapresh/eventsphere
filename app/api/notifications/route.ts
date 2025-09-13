import { type NextRequest, NextResponse } from "next/server"
import { getNotificationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"

// GET /api/notifications - Get user notifications
export const GET = withRole(["participant", "organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const notifications = await getNotificationsCollection()
      const users = await getUsersCollection()

      // Resolve user ID
      const tokenUserId = (user as any).userId || (user as any).id || (user as any)._id
      let dbUser = null as any
      if (tokenUserId && ObjectId.isValid(tokenUserId)) {
        dbUser = await users.findOne({ _id: new ObjectId(tokenUserId) })
      }
      if (!dbUser && (user as any).email) {
        dbUser = await users.findOne({ email: (user as any).email })
      }
      const resolvedUserId: string = dbUser?._id?.toString() || tokenUserId || ""

      if (!resolvedUserId) {
        return NextResponse.json({ error: "Unable to resolve user identity" }, { status: 401 })
      }

      // Get user notifications
      console.log("Fetching notifications for userId:", resolvedUserId)
      
      // Try both string and ObjectId formats for userId to handle different storage formats
      const userNotifications = await notifications.find({
        $or: [
          { userId: resolvedUserId },
          { userId: new ObjectId(resolvedUserId) }
        ]
      }).sort({ createdAt: -1 }).limit(50).toArray()

      console.log("Found notifications:", userNotifications.length)
      console.log("Sample notification:", userNotifications[0])

      return NextResponse.json({ notifications: userNotifications })
    } catch (error) {
      console.error("Notifications fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }
  }
)

// POST /api/notifications - Mark notification as read
export const POST = withRole(["participant", "organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const { notificationId } = await req.json()
      const notifications = await getNotificationsCollection()
      const users = await getUsersCollection()

      // Resolve user ID
      const tokenUserId = (user as any).userId || (user as any).id || (user as any)._id
      let dbUser = null as any
      if (tokenUserId && ObjectId.isValid(tokenUserId)) {
        dbUser = await users.findOne({ _id: new ObjectId(tokenUserId) })
      }
      if (!dbUser && (user as any).email) {
        dbUser = await users.findOne({ email: (user as any).email })
      }
      const resolvedUserId: string = dbUser?._id?.toString() || tokenUserId || ""

      if (!resolvedUserId) {
        return NextResponse.json({ error: "Unable to resolve user identity" }, { status: 401 })
      }

      // Mark notification as read
      await notifications.updateOne(
        { 
          _id: new ObjectId(notificationId),
          $or: [
            { userId: resolvedUserId },
            { userId: new ObjectId(resolvedUserId) }
          ]
        },
        { $set: { isRead: true, readAt: new Date() } }
      )

      return NextResponse.json({ message: "Notification marked as read" })
    } catch (error) {
      console.error("Mark notification read error:", error)
      return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
    }
  }
)