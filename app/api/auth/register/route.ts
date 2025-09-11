import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/database/collections"
import { hashPassword, validatePassword } from "@/lib/auth/password"
import { generateToken } from "@/lib/auth/jwt"
import type { User } from "@/lib/models/User"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, department, enrollmentNumber, institutionalId } = await req.json()

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Name, email, password, and role are required" }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: "Password validation failed", details: passwordValidation.errors },
        { status: 400 },
      )
    }

    // Role-specific validation
    if (role === "participant" && (!department || !enrollmentNumber)) {
      return NextResponse.json(
        { error: "Department and enrollment number are required for participants" },
        { status: 400 },
      )
    }

    if (role === "organizer" && (!institutionalId || !department)) {
      return NextResponse.json(
        { error: "Institutional ID and department are required for organizers" },
        { status: 400 },
      )
    }

    const users = await getUsersCollection()

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(enrollmentNumber ? [{ enrollmentNumber }] : []),
        ...(institutionalId ? [{ institutionalId }] : []),
      ],
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email, enrollment number, or institutional ID already exists" },
        { status: 409 },
      )
    }

    const hashedPassword = await hashPassword(password)

    const newUser: User = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      department: department?.trim(),
      enrollmentNumber: enrollmentNumber?.trim(),
      institutionalId: institutionalId?.trim(),
      isApproved: role === "organizer" ? false : true, // Organizers need approval
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }

    const result = await users.insertOne(newUser)
    newUser._id = result.insertedId.toString()

    // Auto-login for approved users
    if (newUser.isApproved) {
      const token = generateToken(newUser)

      const response = NextResponse.json({
        message: "Registration successful",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          enrollmentNumber: newUser.enrollmentNumber,
        },
      })

      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
      })

      return response
    } else {
      return NextResponse.json({
        message: "Registration successful. Your account is pending approval from an administrator.",
        requiresApproval: true,
      })
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
