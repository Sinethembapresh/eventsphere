import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/auth/middleware"
import { getEventsCollection } from "@/lib/database/collections"

// GET /api/admin/events - List all events (admin only)
export const GET = withRole(["admin"])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // approved | pending | rejected | completed | all
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const events = await getEventsCollection()

    const filter: any = {}
    if (status && status !== "all") {
      filter.status = status
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { organizerName: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [list, total] = await Promise.all([
      events.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      events.countDocuments(filter),
    ])

    return NextResponse.json({
      events: list,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Admin list events error:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
})
