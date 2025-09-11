import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/auth/middleware"
import { getUsersCollection } from "@/lib/database/collections"

// GET /api/admin/users - Get all users with filtering
export const GET = withRole(["admin"])(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    const users = await getUsersCollection()

    // Build filter
    const filter: any = {}

    if (role && role !== "all") {
      filter.role = role
    }

    if (status === "pending") {
      filter.isApproved = false
      filter.role = "organizer"
    } else if (status === "active") {
      filter.isActive = true
    } else if (status === "inactive") {
      filter.isActive = false
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { enrollmentNumber: { $regex: search, $options: "i" } },
      ]
    }

    const skip = (page - 1) * limit

    const [userList, totalCount] = await Promise.all([
      users
        .find(filter)
        .project({ password: 0 }) // Exclude password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      users.countDocuments(filter),
    ])

    return NextResponse.json({
      users: userList,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Admin get users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
})
