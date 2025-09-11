import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, type JWTPayload } from "./jwt"

export function withAuth(handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = req.headers.get("authorization")?.replace("Bearer ", "") || req.cookies.get("auth-token")?.value

      if (!token) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      }

      return handler(req, user)
    } catch (error) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}

export function withRole(roles: string[]) {
  return (handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) =>
    withAuth(async (req: NextRequest, user: JWTPayload) => {
      if (!roles.includes(user.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
      return handler(req, user)
    })
}
