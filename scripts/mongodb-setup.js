// MongoDB setup script for EventSphere
// Run this script in MongoDB shell or MongoDB Compass

const db = db.getSiblingDB("eventsphere")

// Create collections with validation schemas
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password", "role", "createdAt", "isActive"],
      properties: {
        name: { bsonType: "string", minLength: 2, maxLength: 100 },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        password: { bsonType: "string", minLength: 6 },
        role: { enum: ["normal", "participant", "organizer", "admin"] },
        department: { bsonType: "string" },
        enrollmentNumber: { bsonType: "string" },
        institutionalId: { bsonType: "string" },
        isApproved: { bsonType: "bool" },
        twoFactorEnabled: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        lastLogin: { bsonType: "date" },
        isActive: { bsonType: "bool" },
      },
    },
  },
})

db.createCollection("events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "category", "venue", "date", "organizerId", "status", "createdAt", "isActive"],
      properties: {
        title: { bsonType: "string", minLength: 5, maxLength: 200 },
        description: { bsonType: "string", minLength: 20 },
        category: { bsonType: "string" },
        department: { bsonType: "string" },
        venue: { bsonType: "string" },
        date: { bsonType: "date" },
        time: { bsonType: "string" },
        maxParticipants: { bsonType: "int", minimum: 1 },
        currentParticipants: { bsonType: "int", minimum: 0 },
        organizerId: { bsonType: "string" },
        organizerName: { bsonType: "string" },
        status: { enum: ["pending", "approved", "rejected", "cancelled", "completed"] },
        registrationDeadline: { bsonType: "date" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" },
        isActive: { bsonType: "bool" },
      },
    },
  },
})

db.createCollection("registrations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["eventId", "userId"],
      properties: {
        eventId: { bsonType: "string" },
        userId: { bsonType: "string" },
        registrationDate: { bsonType: "date" },
        status: { enum: ["pending", "confirmed", "cancelled"] },
      },
    },
  },
})

db.createCollection("feedback", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["eventId", "userId", "rating", "comment"],
      properties: {
        eventId: { bsonType: "string" },
        userId: { bsonType: "string" },
        rating: { bsonType: "int", minimum: 1, maximum: 5 },
        comment: { bsonType: "string" },
        feedbackDate: { bsonType: "date" },
      },
    },
  },
})

db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "type", "message", "createdAt", "isRead"],
      properties: {
        userId: { bsonType: "string" },
        type: { enum: ["event", "registration", "feedback"] },
        message: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        isRead: { bsonType: "bool" },
      },
    },
  },
})

db.createCollection("categories", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "description"],
      properties: {
        name: { bsonType: "string", minLength: 2, maxLength: 100 },
        description: { bsonType: "string", minLength: 10 },
      },
    },
  },
})

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ department: 1 })
db.users.createIndex({ enrollmentNumber: 1 }, { unique: true, sparse: true })

db.events.createIndex({ organizerId: 1 })
db.events.createIndex({ category: 1 })
db.events.createIndex({ department: 1 })
db.events.createIndex({ date: 1 })
db.events.createIndex({ status: 1 })
db.events.createIndex({ title: "text", description: "text" })

db.registrations.createIndex({ eventId: 1 })
db.registrations.createIndex({ userId: 1 })
db.registrations.createIndex({ eventId: 1, userId: 1 }, { unique: true })

db.feedback.createIndex({ eventId: 1 })
db.feedback.createIndex({ userId: 1 })
db.feedback.createIndex({ rating: 1 })

db.notifications.createIndex({ userId: 1 })
db.notifications.createIndex({ type: 1 })
db.notifications.createIndex({ createdAt: 1 })
db.notifications.createIndex({ isRead: 1 })

db.categories.createIndex({ name: 1 }, { unique: true })

// Insert default admin user
db.users.insertOne({
  name: "System Administrator",
  email: "admin@eventsphere.edu",
  password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIf6", // password: admin123
  role: "admin",
  isApproved: true,
  twoFactorEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
})

// Insert sample categories
db.categories.insertMany([
  { name: "Technical", description: "Programming, AI, Web Development" },
  { name: "Cultural", description: "Music, Dance, Art, Literature" },
  { name: "Sports", description: "Cricket, Football, Basketball, Athletics" },
  { name: "Academic", description: "Seminars, Workshops, Conferences" },
  { name: "Social", description: "Community Service, Awareness Programs" },
  { name: "Career", description: "Job Fairs, Placement Drives, Internships" },
])

print("EventSphere database setup completed successfully!")
