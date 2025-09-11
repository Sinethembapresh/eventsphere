import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/auth/middleware"
import { getEventsCollection } from "@/lib/database/collections"

// GET /api/admin/events/pending - Get pending events
export const GET = withRole(["admin"])(async (req: NextRequest) => {
  try {
    const events = await getEventsCollection()

    const pendingEvents = await events
      .find({
        status: "pending",
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ events: pendingEvents })
  } catch (error) {
    console.error("Get pending events error:", error)
    return NextResponse.json({ error: "Failed to fetch pending events" }, { status: 500 })
  }
})
