import { type NextRequest, NextResponse } from "next/server"
import { getNotificationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"
import type { Notification } from "@/lib/models/Notification"

// GET /api/organizer/notifications - Get all notifications (organizers can see all)
export const GET = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const notifications = await getNotificationsCollection()
      const users = await getUsersCollection()

      // Get all notifications for organizers/admins
      const allNotifications = await notifications
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray()

      // Populate user information for each notification
      const notificationsWithUsers = await Promise.all(
        allNotifications.map(async (notification) => {
          const notificationUser = await users.findOne({ 
            _id: new ObjectId(notification.userId) 
          })
          return {
            ...notification,
            user: notificationUser ? {
              name: notificationUser.userName,
              email: notificationUser.userEmail,
              role: notificationUser.role
            } : null
          }
        })
      )

      return NextResponse.json({ notifications: notificationsWithUsers })
    } catch (error) {
      console.error("Get notifications error:", error)
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
    }
  }
)

// POST /api/organizer/notifications - Create notification (organizers only)
export const POST = withRole(["organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const notificationData = await req.json()
      const {
        title,
        message,
        type = "system_announcement",
        priority = "medium",
        targetUsers = "all", // "all", "participants", "organizers", or specific user IDs
        eventId,
        scheduledFor,
        expiresAt
      } = notificationData

      if (!title || !message) {
        return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
      }

      const notifications = await getNotificationsCollection()
      const users = await getUsersCollection()

      // Determine target users based on the targetUsers parameter
      let targetUserIds: string[] = []
      
      if (targetUsers === "all") {
        const allUsers = await users.find({}).toArray()
        targetUserIds = allUsers.map(u => u._id.toString())
      } else if (targetUsers === "participants") {
        const participantUsers = await users.find({ role: "participant" }).toArray()
        targetUserIds = participantUsers.map(u => u._id.toString())
      } else if (targetUsers === "organizers") {
        const organizerUsers = await users.find({ role: "organizer" }).toArray()
        targetUserIds = organizerUsers.map(u => u._id.toString())
      } else if (Array.isArray(targetUsers)) {
        targetUserIds = targetUsers
      }

      if (targetUserIds.length === 0) {
        return NextResponse.json({ error: "No target users found" }, { status: 400 })
      }

      // Create notifications for each target user
      const notificationPromises = targetUserIds.map(userId => {
        const notification: Omit<Notification, "_id"> = {
          userId,
          type: type as Notification["type"],
          title: title.trim(),
          message: message.trim(),
          eventId,
          isRead: false,
          priority: priority as Notification["priority"],
          scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
          createdAt: new Date(),
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        }
        return notifications.insertOne(notification)
      })

      await Promise.all(notificationPromises)

      return NextResponse.json({
        message: `Notification created and sent to ${targetUserIds.length} users`,
        targetCount: targetUserIds.length
      })
    } catch (error) {
      console.error("Create notification error:", error)
      return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
    }
  }
)

