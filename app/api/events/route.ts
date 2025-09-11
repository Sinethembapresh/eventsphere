import { type NextRequest, NextResponse } from "next/server"
import { getEventsCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import type { Event } from "@/lib/models/Event"

// GET /api/events - List events with filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const department = searchParams.get("department")
    const status = searchParams.get("status") || "approved"
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const sortBy = searchParams.get("sortBy") || "date"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    const events = await getEventsCollection()

    // Build filter query
    const filter: any = { isActive: true }

    if (status) {
      filter.status = status
    }

    if (category && category !== "all") {
      filter.category = category
    }

    if (department && department !== "all") {
      filter.department = department
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { organizerName: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort query
    const sort: any = {}
    if (sortBy === "date") {
      sort.date = sortOrder === "desc" ? -1 : 1
    } else if (sortBy === "title") {
      sort.title = sortOrder === "desc" ? -1 : 1
    } else if (sortBy === "created") {
      sort.createdAt = sortOrder === "desc" ? -1 : 1
    }

    const skip = (page - 1) * limit

    const [eventList, totalCount] = await Promise.all([
      events.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      events.countDocuments(filter),
    ])

    return NextResponse.json({
      events: eventList,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Get events error:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

// POST /api/events - Create new event (organizers only)
export const POST = withRole(["organizer", "admin"])(async (req: NextRequest, user) => {
  try {
    const eventData = await req.json()

    const {
      title,
      description,
      category,
      department,
      venue,
      date,
      time,
      endTime,
      maxParticipants,
      registrationDeadline,
      tags,
      requirements,
      prizes,
      contactInfo,
    } = eventData

    // Validate required fields
    if (!title || !description || !category || !venue || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate dates
    const eventDate = new Date(date)
    const regDeadline = new Date(registrationDeadline || date)

    if (eventDate <= new Date()) {
      return NextResponse.json({ error: "Event date must be in the future" }, { status: 400 })
    }

    if (regDeadline >= eventDate) {
      return NextResponse.json({ error: "Registration deadline must be before event date" }, { status: 400 })
    }

    const events = await getEventsCollection()

    const newEvent: Event = {
      title: title.trim(),
      description: description.trim(),
      category,
      department: department || user.role === "organizer" ? user.department : "",
      venue: venue.trim(),
      date: eventDate,
      time,
      endTime,
      maxParticipants: maxParticipants ? Number.parseInt(maxParticipants) : undefined,
      currentParticipants: 0,
      organizerId: user.userId,
      organizerName: user.name,
      status: user.role === "admin" ? "approved" : "pending",
      registrationDeadline: regDeadline,
      tags: tags || [],
      requirements: requirements || [],
      prizes: prizes || [],
      contactInfo: contactInfo || { email: user.email },
      media: { images: [], videos: [], documents: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }

    const result = await events.insertOne(newEvent)

    return NextResponse.json(
      {
        message: user.role === "admin" ? "Event created successfully" : "Event created and pending approval",
        eventId: result.insertedId,
        status: newEvent.status,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
})
