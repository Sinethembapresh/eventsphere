import { type NextRequest, NextResponse } from "next/server"
import { getNotificationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"

// POST /api/fix-notifications - Fix notification distribution for all users
export const POST = withRole(["admin", "organizer"])(
  async (req: NextRequest, user) => {
    try {
      const notifications = await getNotificationsCollection()
      const users = await getUsersCollection()

      // Get all users
      const allUsers = await users.find({}).toArray()
      console.log("Found", allUsers.length, "users in database")

      // Get the DeadLine notification template
      const deadLineNotification = await notifications.findOne({ title: "DeadLine" })
      if (!deadLineNotification) {
        return NextResponse.json({ error: "DeadLine notification not found" }, { status: 404 })
      }

      console.log("Found DeadLine notification for user:", deadLineNotification.userId)

      // Check which users already have this notification
      const existingDeadLineNotifications = await notifications.find({ title: "DeadLine" }).toArray()
      const existingUserIds = existingDeadLineNotifications.map(n => n.userId)
      
      // Find users who don't have this notification
      const allUserIds = allUsers.map(u => u._id.toString())
      const missingUserIds = allUserIds.filter(userId => !existingUserIds.includes(userId))

      console.log("Users missing DeadLine notification:", missingUserIds.length)

      if (missingUserIds.length === 0) {
        return NextResponse.json({ 
          message: "All users already have the DeadLine notification",
          totalUsers: allUsers.length,
          existingNotifications: existingDeadLineNotifications.length
        })
      }

      // Create the notification for missing users
      const notificationTemplate = {
        title: deadLineNotification.title,
        message: deadLineNotification.message,
        type: deadLineNotification.type,
        priority: deadLineNotification.priority,
        eventId: deadLineNotification.eventId,
        isRead: false,
        createdAt: deadLineNotification.createdAt, // Keep original creation time
        expiresAt: deadLineNotification.expiresAt
      }

      const newNotifications = missingUserIds.map(userId => ({
        ...notificationTemplate,
        userId
      }))

      const result = await notifications.insertMany(newNotifications)
      console.log("Created", result.insertedCount, "new DeadLine notifications")

      // Verify the fix
      const finalDeadLineNotifications = await notifications.find({ title: "DeadLine" }).toArray()

      return NextResponse.json({
        message: `Successfully created ${result.insertedCount} DeadLine notifications`,
        totalUsers: allUsers.length,
        totalDeadLineNotifications: finalDeadLineNotifications.length,
        missingUsersFixed: missingUserIds.length,
        success: finalDeadLineNotifications.length === allUsers.length
      })

    } catch (error) {
      console.error("Fix notifications error:", error)
      return NextResponse.json({ error: "Failed to fix notification distribution" }, { status: 500 })
    }
  }
)