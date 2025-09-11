import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/auth/middleware"
import {
  getUsersCollection,
  getEventsCollection,
  getRegistrationsCollection,
  getFeedbackCollection,
} from "@/lib/database/collections"

// GET /api/admin/analytics - Get system analytics
export const GET = withRole(["admin"])(async (req: NextRequest) => {
  try {
    const users = await getUsersCollection()
    const events = await getEventsCollection()
    const registrations = await getRegistrationsCollection()
    const feedback = await getFeedbackCollection()

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // User statistics
    const [totalUsers, activeUsers, newUsersThisMonth, newUsersLastMonth, pendingOrganizers] = await Promise.all([
      users.countDocuments({ isActive: true }),
      users.countDocuments({ isActive: true, lastLogin: { $gte: startOfMonth } }),
      users.countDocuments({ createdAt: { $gte: startOfMonth } }),
      users.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfMonth },
      }),
      users.countDocuments({ role: "organizer", isApproved: false }),
    ])

    // Event statistics
    const [totalEvents, approvedEvents, pendingEvents, completedEvents, eventsThisMonth] = await Promise.all([
      events.countDocuments({ isActive: true }),
      events.countDocuments({ status: "approved", isActive: true }),
      events.countDocuments({ status: "pending", isActive: true }),
      events.countDocuments({ status: "completed", isActive: true }),
      events.countDocuments({
        createdAt: { $gte: startOfMonth },
        isActive: true,
      }),
    ])

    // Registration statistics
    const [totalRegistrations, registrationsThisMonth, attendanceRate] = await Promise.all([
      registrations.countDocuments({}),
      registrations.countDocuments({ registrationDate: { $gte: startOfMonth } }),
      registrations
        .aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              attended: {
                $sum: {
                  $cond: [{ $eq: ["$status", "attended"] }, 1, 0],
                },
              },
            },
          },
        ])
        .toArray(),
    ])

    // Feedback statistics
    const [totalFeedback, averageRating, feedbackThisMonth] = await Promise.all([
      feedback.countDocuments({}),
      feedback.aggregate([{ $group: { _id: null, avgRating: { $avg: "$rating" } } }]).toArray(),
      feedback.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ])

    // Calculate trends
    const userGrowth = newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0

    const attendancePercentage = attendanceRate[0] ? (attendanceRate[0].attended / attendanceRate[0].total) * 100 : 0

    // Category distribution
    const categoryStats = await events
      .aggregate([
        { $match: { isActive: true, status: "approved" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray()

    // Department distribution
    const departmentStats = await events
      .aggregate([
        { $match: { isActive: true, status: "approved" } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray()

    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        growth: userGrowth,
        pendingOrganizers,
      },
      events: {
        total: totalEvents,
        approved: approvedEvents,
        pending: pendingEvents,
        completed: completedEvents,
        thisMonth: eventsThisMonth,
      },
      registrations: {
        total: totalRegistrations,
        thisMonth: registrationsThisMonth,
        attendanceRate: attendancePercentage,
      },
      feedback: {
        total: totalFeedback,
        averageRating: averageRating[0]?.avgRating || 0,
        thisMonth: feedbackThisMonth,
      },
      distributions: {
        categories: categoryStats,
        departments: departmentStats,
      },
    })
  } catch (error) {
    console.error("Admin analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
})
