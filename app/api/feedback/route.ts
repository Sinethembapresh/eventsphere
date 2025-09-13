import { type NextRequest, NextResponse } from "next/server"
import { getFeedbackCollection, getUsersCollection, getEventsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"
import type { EventFeedback } from "@/lib/models/Feedback"

// GET /api/feedback - Get feedback for events (participants can see their own, organizers can see all)
export const GET = withRole(["participant", "organizer", "admin"])(
  async (req: NextRequest, user) => {
    try {
      const feedback = await getFeedbackCollection()
      const users = await getUsersCollection()
      const events = await getEventsCollection()

      // Resolve user ID
      const tokenUserId = (user as any).userId || (user as any).id || (user as any)._id
      let dbUser = null as any
      if (tokenUserId && ObjectId.isValid(tokenUserId)) {
        dbUser = await users.findOne({ _id: new ObjectId(tokenUserId) })
      }
      if (!dbUser && (user as any).email) {
        dbUser = await users.findOne({ email: (user as any).email })
      }
      const resolvedUserId: string = dbUser?._id?.toString() || tokenUserId || ""

      if (!resolvedUserId) {
        return NextResponse.json({ error: "Unable to resolve user identity" }, { status: 401 })
      }

      const { searchParams } = new URL(req.url)
      const eventId = searchParams.get("eventId")
      const userRole = dbUser?.role || (user as any).role

      let query: any = {}
      
      // Participants can only see their own feedback
      if (userRole === "participant") {
        query.userId = resolvedUserId
      }
      
      // Add event filter if specified
      if (eventId) {
        query.eventId = eventId
      }

      const feedbackList = await feedback.find(query).sort({ createdAt: -1 }).toArray()

      // Populate event and user information
      const feedbackWithDetails = await Promise.all(
        feedbackList.map(async (fb) => {
          const event = await events.findOne({ _id: new ObjectId(fb.eventId) })
          const feedbackUser = await users.findOne({ _id: new ObjectId(fb.userId) })
          
          return {
            ...fb,
            event: event ? {
              _id: event._id.toString(),
              title: event.title,
              date: event.date,
              venue: event.venue
            } : null,
            user: feedbackUser ? {
              _id: feedbackUser._id.toString(),
              name: feedbackUser.userName,
              email: feedbackUser.userEmail
            } : null
          }
        })
      )

      return NextResponse.json({ feedback: feedbackWithDetails })
    } catch (error) {
      console.error("Get feedback error:", error)
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
    }
  }
)

// POST /api/feedback - Submit feedback (participants only)
export const POST = withRole(["participant"])(
  async (req: NextRequest, user) => {
    try {
      const feedbackData = await req.json()
      const {
        eventId,
        rating,
        comment,
        categories,
        isAnonymous = false
      } = feedbackData

      if (!eventId || !rating || rating < 1 || rating > 5) {
        return NextResponse.json({ 
          error: "Event ID and rating (1-5) are required" 
        }, { status: 400 })
      }

      const feedback = await getFeedbackCollection()
      const users = await getUsersCollection()
      const events = await getEventsCollection()

      // Resolve user ID
      const tokenUserId = (user as any).userId || (user as any).id || (user as any)._id
      let dbUser = null as any
      if (tokenUserId && ObjectId.isValid(tokenUserId)) {
        dbUser = await users.findOne({ _id: new ObjectId(tokenUserId) })
      }
      if (!dbUser && (user as any).email) {
        dbUser = await users.findOne({ email: (user as any).email })
      }
      const resolvedUserId: string = dbUser?._id?.toString() || tokenUserId || ""

      if (!resolvedUserId) {
        return NextResponse.json({ error: "Unable to resolve user identity" }, { status: 401 })
      }

      // Check if event exists
      const event = await events.findOne({ _id: new ObjectId(eventId) })
      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }

      // Check if user has already submitted feedback for this event
      const existingFeedback = await feedback.findOne({
        eventId,
        userId: resolvedUserId
      })

      if (existingFeedback) {
        return NextResponse.json({ 
          error: "You have already submitted feedback for this event" 
        }, { status: 400 })
      }

      // Create new feedback
      const newFeedback: Omit<EventFeedback, "_id"> = {
        eventId,
        userId: resolvedUserId,
        userName: isAnonymous ? "Anonymous" : (dbUser?.userName || "Unknown"),
        rating,
        comment: comment?.trim() || "",
        categories: categories || {
          organization: rating,
          content: rating,
          venue: rating,
          overall: rating
        },
        isAnonymous,
        createdAt: new Date(),
        isModerated: false
      }

      const result = await feedback.insertOne(newFeedback)

      return NextResponse.json({
        message: "Feedback submitted successfully",
        feedbackId: result.insertedId
      })
    } catch (error) {
      console.error("Submit feedback error:", error)
      return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
    }
  }
)