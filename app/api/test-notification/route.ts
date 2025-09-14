import { type NextRequest, NextResponse } from "next/server"
import { getNotificationsCollection, getUsersCollection } from "@/lib/database/collections"
import { ObjectId } from "mongodb"

// POST /api/test-notification - Create a test notification
export async function POST(req: NextRequest) {
  try {
    const { userId, title, message, sendToAll = false } = await req.json()
    
    if (!title || !message) {
      return NextResponse.json({ error: "title and message are required" }, { status: 400 })
    }

    if (!sendToAll && !userId) {
      return NextResponse.json({ error: "userId is required when sendToAll is false" }, { status: 400 })
    }

    const notifications = await getNotificationsCollection()
    const users = await getUsersCollection()
    
    const notificationTemplate = {
      type: "system_announcement",
      title,
      message,
      eventId: null,
      isRead: false,
      priority: "medium",
      scheduledFor: null,
      createdAt: new Date(),
      expiresAt: null
    }

    let result;
    let message;

    if (sendToAll) {
      // Get all users and create notification for each
      const allUsers = await users.find({}).toArray()
      const targetUserIds = allUsers.map(u => u._id.toString())
      
      const newNotifications = targetUserIds.map(userId => ({
        ...notificationTemplate,
        userId
      }))

      result = await notifications.insertMany(newNotifications)
      message = `Test notification created for all ${targetUserIds.length} users`
    } else {
      // Create notification for single user
      const notification = {
        ...notificationTemplate,
        userId
      }

      result = await notifications.insertOne(notification)
      message = "Test notification created for single user"
    }
    
    return NextResponse.json({ 
      success: true, 
      message,
      insertedCount: result.insertedCount || 1,
      insertedIds: result.insertedIds || [result.insertedId]
    })
  } catch (error) {
    console.error("Test notification creation error:", error)
    return NextResponse.json({ error: "Failed to create test notification" }, { status: 500 })
  }
}

