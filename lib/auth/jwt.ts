import jwt from "jsonwebtoken"
import type { User } from "../models/User"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export interface JWTPayload {
  userId: string
  email: string
  role: string
  name: string
  department?: string
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user._id!,
    email: user.email,
    role: user.role,
    name: user.name,
    department: user.department,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" })
}
