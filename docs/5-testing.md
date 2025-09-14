# Testing Documentation

## Test Data

### Sample Users
```javascript
const testUsers = [
  {
    email: "admin@eventsphere.com",
    password: "Admin@123",
    name: "System Admin",
    role: "admin"
  },
  {
    email: "organizer@eventsphere.com",
    password: "Organizer@123",
    name: "Event Organizer",
    role: "organizer"
  },
  {
    email: "user@eventsphere.com",
    password: "User@123",
    name: "Regular User",
    role: "user"
  }
];
```

### Sample Events
```javascript
const testEvents = [
  {
    title: "Technical Workshop",
    description: "Learn about modern web development",
    category: "Technical Events",
    date: "2024-03-15",
    location: "Computer Lab A"
  },
  {
    title: "Cultural Festival",
    description: "Annual cultural celebration",
    category: "Cultural Events",
    date: "2024-04-01",
    location: "Main Auditorium"
  }
];
```

### Sample Gallery Images
```javascript
const testImages = [
  {
    imageUrl: "https://example.com/image1.jpg",
    category: "Technical Events",
    title: "Programming Workshop"
  },
  {
    imageUrl: "https://example.com/image2.jpg",
    category: "Cultural Events",
    title: "Dance Performance"
  }
];
```

## Test Cases

### Authentication Tests
1. User Registration
   - Valid registration data
   - Invalid email format
   - Duplicate email
   - Weak password

2. User Login
   - Valid credentials
   - Invalid password
   - Non-existent user
   - Inactive account

### Event Management Tests
1. Event Creation
   - Valid event data
   - Missing required fields
   - Invalid date
   - Invalid capacity

2. Event Approval
   - Admin approval
   - Admin rejection
   - Invalid status change

### Gallery Tests
1. Image Upload
   - Valid image URL
   - Invalid URL
   - Wrong category
   - Large image size

2. Gallery Display
   - Category filtering
   - Pagination
   - Sorting
   - Image loading

## API Test Data

### Authentication Endpoints
```javascript
// POST /auth/register
{
  "email": "test@example.com",
  "password": "Test@123",
  "name": "Test User",
  "role": "user"
}

// POST /auth/login
{
  "email": "test@example.com",
  "password": "Test@123"
}
```

### Event Endpoints
```javascript
// POST /api/events
{
  "title": "Test Event",
  "description": "Test Description",
  "category": "Technical Events",
  "date": "2024-03-01",
  "location": "Test Location",
  "capacity": 100
}

// PUT /api/events/:id
{
  "status": "approved"
}
```

### Gallery Endpoints
```javascript
// POST /api/gallery
{
  "imageUrl": "https://example.com/test.jpg",
  "category": "Technical Events",
  "title": "Test Image"
}
```

## Test Environments

### Development Environment
- Local MongoDB instance
- Test email service
- Mock storage service

### Staging Environment
- MongoDB Atlas staging cluster
- Staging email service
- Test storage bucket

### Production Environment
- MongoDB Atlas production cluster
- Production email service
- Production storage bucket

## Test Coverage

### Unit Tests
- Controllers: 90%
- Models: 95%
- Utilities: 85%
- Middleware: 90%

### Integration Tests
- API endpoints: 85%
- Database operations: 90%
- Authentication flows: 95%

### End-to-End Tests
- User flows: 80%
- Admin flows: 85%
- Event flows: 80%