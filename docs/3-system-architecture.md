# System Architecture

## System Flow Diagrams

### Authentication Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Auth API
    participant Database
    
    User->>Frontend: Enter credentials
    Frontend->>Auth API: POST /auth/login
    Auth API->>Database: Verify credentials
    Database-->>Auth API: User data
    Auth API-->>Frontend: JWT token
    Frontend-->>User: Redirect to dashboard
```

### Event Creation Flow
```mermaid
sequenceDiagram
    participant Organizer
    participant Frontend
    participant API
    participant Database
    participant Admin
    
    Organizer->>Frontend: Create event
    Frontend->>API: POST /api/events
    API->>Database: Save event
    Database-->>API: Event saved
    API-->>Frontend: Success
    Frontend-->>Organizer: Confirmation
    API->>Admin: Notification
    Admin->>API: Review & approve
    API->>Database: Update status
    API->>Organizer: Notification
```

### Gallery Management Flow
```mermaid
flowchart TD
    A[Admin] -->|Upload Image| B[Gallery Form]
    B -->|Submit| C[API]
    C -->|Save| D[Database]
    D -->|Confirm| C
    C -->|Update UI| B
    E[User] -->|View| F[Gallery Page]
    F -->|Fetch| C
    C -->|Get Images| D
    D -->|Return| C
    C -->|Display| F
```

## Component Architecture

### Frontend Components
```mermaid
graph TD
    A[App Layout] --> B[Navigation]
    A --> C[Pages]
    C --> D[Home]
    C --> E[Events]
    C --> F[Gallery]
    C --> G[Admin]
    G --> H[Dashboard]
    G --> I[User Management]
    G --> J[Event Approval]
    G --> K[Gallery Management]
```

### Backend Architecture
```mermaid
graph TD
    A[Express App] --> B[Routes]
    B --> C[Auth Routes]
    B --> D[Event Routes]
    B --> E[Gallery Routes]
    B --> F[Admin Routes]
    A --> G[Middleware]
    G --> H[Auth Middleware]
    G --> I[Error Handling]
    A --> J[Controllers]
    J --> K[Auth Controller]
    J --> L[Event Controller]
    J --> M[Gallery Controller]
    A --> N[Database]
    N --> O[Models]
```

## Database Schema

### Users Collection
```mermaid
classDiagram
    class User {
        +String _id
        +String email
        +String password
        +String role
        +String name
        +Date createdAt
        +Boolean isActive
    }
```

### Events Collection
```mermaid
classDiagram
    class Event {
        +String _id
        +String title
        +String description
        +String category
        +Date date
        +String location
        +String organizerId
        +String status
        +Number capacity
        +Array registrations
        +Date createdAt
    }
```

### Gallery Collection
```mermaid
classDiagram
    class GalleryImage {
        +String _id
        +String imageUrl
        +String category
        +Date createdAt
        +String uploadedBy
    }
```

## Network Architecture
```mermaid
graph TD
    A[Client] -->|HTTPS| B[Vercel Edge]
    B -->|Route| C[Next.js App]
    C -->|API| D[Express Backend]
    D -->|Query| E[MongoDB Atlas]
    D -->|Storage| F[Cloudinary]
```