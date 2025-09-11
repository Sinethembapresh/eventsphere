import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/middleware"
import { getUsersCollection } from "@/lib/database/collections"
import type { User } from "@/lib/models/User"

export const GET = withAuth(async (req: NextRequest, tokenUser) => {
  try {
    const users = await getUsersCollection()
    const user = (await users.findOne({ _id: tokenUser.userId })) as User

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        enrollmentNumber: user.enrollmentNumber,
        isApproved: user.isApproved,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
