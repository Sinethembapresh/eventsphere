import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/middleware"

// GET /api/test-auth - Test authentication and user info
export const GET = withAuth(async (req: NextRequest, user) => {
  return NextResponse.json({
    message: "Authentication successful",
    user: {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department
    }
  })
})
