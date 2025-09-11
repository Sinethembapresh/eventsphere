import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Notification } from "@/lib/models/Notification"
import { verifyToken } from "@/lib/auth/jwt"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(authHeader.substring(7))
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const notifications = await Notification.find({
      $or: [{ userId: decoded.userId }, { type: "system", targetRole: decoded.role }],
    })
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { title, message, type, userId, eventId, targetRole } = await request.json()

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(authHeader.substring(7))
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "organizer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notification = new Notification({
      title,
      message,
      type: type || "info",
      userId,
      eventId,
      targetRole,
      createdBy: decoded.userId,
    })

    await notification.save()

    return NextResponse.json({
      message: "Notification created successfully",
      notification,
    })
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
