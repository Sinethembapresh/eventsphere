import { type NextRequest, NextResponse } from "next/server"
import { getNotificationsCollection, getUsersCollection } from "@/lib/database/collections"
import { ObjectId } from "mongodb"

// POST /api/test-notification - Create a test notification
export async function POST(req: NextRequest) {
  try {
    const { userId, title, message } = await req.json()
    
    if (!userId || !title || !message) {
      return NextResponse.json({ error: "userId, title, and message are required" }, { status: 400 })
    }

    const notifications = await getNotificationsCollection()
    
    const notification = {
      userId,
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

    const result = await notifications.insertOne(notification)
    
    return NextResponse.json({ 
      success: true, 
      message: "Test notification created",
      notificationId: result.insertedId 
    })
  } catch (error) {
    console.error("Test notification creation error:", error)
    return NextResponse.json({ error: "Failed to create test notification" }, { status: 500 })
  }
}

