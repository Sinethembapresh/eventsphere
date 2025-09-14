# Database Design

## Overview
EventSphere uses MongoDB as its primary database, leveraging its flexibility and scalability for event management needs.

## Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,          // Unique, Required
  password: String,       // Hashed, Required
  name: String,          // Required
  role: String,          // enum: ['admin', 'organizer', 'user']
  isActive: Boolean,     // Default: true
  createdAt: Date,       // Default: Date.now
  updatedAt: Date,       // Default: Date.now
  profile: {
    phone: String,
    organization: String,
    department: String
  }
}
```

### Events Collection
```javascript
{
  _id: ObjectId,
  title: String,         // Required
  description: String,   // Required
  category: String,      // Required
  date: Date,           // Required
  location: String,      // Required
  organizerId: ObjectId, // Ref: Users
  status: String,       // enum: ['pending', 'approved', 'rejected']
  capacity: Number,
  registrations: [{
    userId: ObjectId,    // Ref: Users
    status: String,      // enum: ['registered', 'attended', 'cancelled']
    registeredAt: Date
  }],
  createdAt: Date,
  updatedAt: Date,
  images: [{
    url: String,
    caption: String
  }]
}
```

### Gallery Collection
```javascript
{
  _id: ObjectId,
  imageUrl: String,      // Required
  category: String,      // Required
  title: String,
  description: String,
  uploadedBy: ObjectId,  // Ref: Users
  createdAt: Date,
  updatedAt: Date,
  metadata: {
    size: Number,
    format: String,
    dimensions: {
      width: Number,
      height: Number
    }
  }
}
```

### Feedback Collection
```javascript
{
  _id: ObjectId,
  eventId: ObjectId,     // Ref: Events
  userId: ObjectId,      // Ref: Users
  rating: Number,        // 1-5
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Users Collection
```javascript
{
  email: 1,             // Unique index
  role: 1,              // For role-based queries
  "profile.organization": 1  // For organization filtering
}
```

### Events Collection
```javascript
{
  category: 1,          // For category filtering
  date: 1,             // For date-based queries
  status: 1,           // For status filtering
  organizerId: 1       // For organizer's events
}
```

### Gallery Collection
```javascript
{
  category: 1,          // For category filtering
  createdAt: -1        // For recent images
}
```

## Relationships

1. Events -> Users (organizerId)
   - One-to-Many: User can create multiple events
   - Reference relationship

2. Events -> Registrations
   - One-to-Many: Event can have multiple registrations
   - Embedded relationship

3. Gallery -> Users (uploadedBy)
   - One-to-Many: User can upload multiple images
   - Reference relationship

## Data Validation

### Users
- Email must be unique and valid format
- Password must meet security requirements
- Role must be one of predefined values

### Events
- Date must be future date
- Capacity must be positive number
- Status must be valid enum value

### Gallery
- ImageUrl must be valid URL
- Category must be from predefined list

## Backup Strategy

1. **Automated Backups**
   - Daily incremental backups
   - Weekly full backups
   - 30-day retention period

2. **Backup Storage**
   - Primary: MongoDB Atlas
   - Secondary: Cloud storage

3. **Recovery Process**
   - Point-in-time recovery
   - Collection-level restore
   - Document-level restore