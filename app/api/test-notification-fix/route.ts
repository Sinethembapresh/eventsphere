import { type NextRequest, NextResponse } from "next/server"
import { getNotificationsCollection, getUsersCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"

// GET /api/test-notification-fix - Test notification distribution
export const GET = withRole(["admin", "organizer"])(
  async (req: NextRequest, user) => {
    try {
      const notifications = await getNotificationsCollection()
      const users = await getUsersCollection()

      // Get all users
      const allUsers = await users.find({}).toArray()
      
      // Get all DeadLine notifications
      const deadLineNotifications = await notifications.find({ title: "DeadLine" }).toArray()
      
      // Check distribution
      const allUserIds = allUsers.map(u => u._id.toString())
      const deadLineUserIds = deadLineNotifications.map(n => n.userId)
      const missingUserIds = allUserIds.filter(userId => !deadLineUserIds.includes(userId))

      return NextResponse.json({
        totalUsers: allUsers.length,
        totalDeadLineNotifications: deadLineNotifications.length,
        missingUsers: missingUserIds.length,
        missingUserIds: missingUserIds,
        allUsers: allUsers.map(u => ({
          id: u._id.toString(),
          name: u.userName || u.userEmail,
          hasDeadLineNotification: deadLineUserIds.includes(u._id.toString())
        })),
        deadLineNotifications: deadLineNotifications.map(n => ({
          id: n._id.toString(),
          userId: n.userId,
          title: n.title,
          createdAt: n.createdAt
        }))
      })

    } catch (error) {
      console.error("Test notification fix error:", error)
      return NextResponse.json({ error: "Failed to test notification distribution" }, { status: 500 })
    }
  }
)