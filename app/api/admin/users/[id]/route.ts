import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/auth/middleware"
import { getUsersCollection } from "@/lib/database/collections"
import { ObjectId } from "mongodb"

// PUT /api/admin/users/[id] - Update user
export const PUT = withRole(["admin"])(async (req: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const updateData = await req.json()
    const users = await getUsersCollection()

    // Prevent admin from deactivating themselves
    if (params.id === user.userId && updateData.isActive === false) {
      return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 })
    }

    const result = await users.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Admin update user error:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
})

// DELETE /api/admin/users/[id] - Delete user
export const DELETE = withRole(["admin"])(async (req: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const users = await getUsersCollection()

    // Prevent admin from deleting themselves
    if (params.id === user.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Soft delete
    const result = await users.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Admin delete user error:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
})
