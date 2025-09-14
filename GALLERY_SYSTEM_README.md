# Gallery Management System

A comprehensive gallery management system for the EventSphere admin dashboard that allows admins to upload, organize, and manage images by categories.

## 🚀 Features

### Admin Dashboard Features
- **Image Upload**: Drag-and-drop file upload with preview
- **Category Management**: Organize images by event types (Academic, Career, Cultural, Social, Sports, Technical)
- **Real-time Filtering**: Filter images by category with live counts
- **Progress Tracking**: Visual upload progress with percentage
- **Image Management**: View, delete, and manage uploaded images
- **Debug Panel**: Built-in debugging tools for troubleshooting
- **Database Testing**: Test database connectivity and operations

### Public Gallery Features
- **Dynamic Loading**: Fetches images from database
- **Category Navigation**: Browse images by category
- **Fallback System**: Shows static images if no database images exist
- **Responsive Design**: Works on all device sizes
- **Live Counts**: Shows actual image counts per category

## 📁 File Structure

```
app/
├── api/
│   ├── admin/gallery/
│   │   ├── route.ts          # Admin gallery API endpoints
│   │   └── test/route.ts     # Database connectivity test
│   └── gallery/route.ts      # Public gallery API
├── admin/dashboard/page.tsx  # Admin dashboard with gallery tab
└── gallery/
    ├── page.tsx              # Public gallery page
    └── gallery.tsx           # Gallery component

components/
└── admin/
    └── gallery-management.tsx # Admin gallery management component

lib/
└── models/
    └── GalleryMedia.ts       # Gallery data models

scripts/
├── populate-gallery.js       # Populate database with test data
└── test-gallery-setup.js     # Comprehensive system test
```

## 🛠️ Setup Instructions

### 1. Database Setup
```bash
# Run the test and setup script
node test-gallery-setup.js
```

This will:
- Test MongoDB connectivity
- Clear existing test data
- Insert sample images for all categories
- Verify the system is working

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Access the Admin Dashboard
1. Log in as admin
2. Go to Admin Dashboard
3. Click on the "Gallery" tab

### 4. Test the System
1. Click "Show Debug" to see system information
2. Click "Test Database" to verify connectivity
3. Try uploading new images
4. Test category filtering
5. Check the public gallery at `/gallery`

## 🔧 API Endpoints

### Admin Gallery API (`/api/admin/gallery`)

#### GET - Fetch Images
```javascript
// Get all images
GET /api/admin/gallery

// Get images by category
GET /api/admin/gallery?category=academic

// With pagination
GET /api/admin/gallery?limit=50&offset=0
```

**Response:**
```json
{
  "images": [...],
  "totalCount": 25,
  "hasMore": false,
  "categoryCounts": {
    "academic": 5,
    "career": 3,
    "cultural": 4,
    "social": 2,
    "sports": 6,
    "technical": 5
  }
}
```

#### POST - Upload Image
```javascript
POST /api/admin/gallery
Content-Type: multipart/form-data

{
  "title": "Image Title",
  "description": "Image Description",
  "category": "academic",
  "tags": "tag1,tag2,tag3",
  "file": <File>
}
```

#### DELETE - Delete Image
```javascript
DELETE /api/admin/gallery?id=<image_id>
```

### Public Gallery API (`/api/gallery`)

#### GET - Fetch Public Images
```javascript
GET /api/gallery
GET /api/gallery?category=academic
```

## 🗄️ Database Schema

### Gallery Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String, // 'academic', 'career', 'cultural', 'social', 'sports', 'technical'
  imageUrl: String, // Base64 data URL or cloud storage URL
  thumbnailUrl: String, // Optional thumbnail
  uploadedBy: String, // User ID
  uploadedAt: Date,
  isActive: Boolean,
  tags: [String],
  displayOrder: Number,
  fileName: String,
  fileSize: Number,
  mimeType: String
}
```

## 🐛 Debugging

### Debug Panel
The admin gallery management includes a debug panel that shows:
- Selected category
- Total image count
- Filtered image count
- Loading state
- Category counts
- Sample image data

### Database Test
Click "Test Database" to verify:
- MongoDB connectivity
- Collection access
- Query operations
- Data structure

### Console Logging
The system includes comprehensive console logging:
- API request/response details
- Database query information
- Error details and stack traces
- Component state changes

## 🚨 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check MongoDB connection
   - Verify authentication token
   - Check browser console for errors
   - Use debug panel to inspect data

2. **Upload failures**
   - Check file size (max 10MB)
   - Verify file type (images only)
   - Check network connectivity
   - Verify admin permissions

3. **Category filtering not working**
   - Check category names match exactly
   - Verify database queries
   - Check console for errors
   - Use debug panel to inspect data

4. **Database connection issues**
   - Verify MongoDB URI
   - Check network connectivity
   - Verify database permissions
   - Run database test endpoint

### Debug Steps

1. **Enable Debug Panel**
   - Click "Show Debug" in admin gallery
   - Check all displayed values
   - Look for any null/undefined values

2. **Test Database Connectivity**
   - Click "Test Database" button
   - Check response in console
   - Verify all operations succeed

3. **Check Console Logs**
   - Open browser developer tools
   - Look for error messages
   - Check network requests
   - Verify API responses

4. **Verify Authentication**
   - Check if user is logged in
   - Verify admin role
   - Check token validity

## 📊 Performance Considerations

- **Image Storage**: Currently uses base64 encoding (not recommended for production)
- **Pagination**: Implemented for large datasets
- **Caching**: Consider implementing Redis for better performance
- **CDN**: Use cloud storage (AWS S3, Cloudinary) for production
- **Compression**: Implement image compression and thumbnails

## 🔒 Security

- **Authentication**: Admin-only access for management
- **File Validation**: Type and size validation
- **Input Sanitization**: All inputs are sanitized
- **Error Handling**: Secure error messages
- **CORS**: Proper CORS configuration

## 🚀 Production Deployment

1. **Replace Base64 Storage**
   - Implement cloud storage (AWS S3, Cloudinary)
   - Generate thumbnails
   - Implement CDN

2. **Add Caching**
   - Redis for session management
   - Image caching
   - API response caching

3. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Database monitoring

4. **Backup**
   - Regular database backups
   - Image backup strategy
   - Disaster recovery plan

## 📝 Future Enhancements

- [ ] Image compression and optimization
- [ ] Bulk upload functionality
- [ ] Image editing tools
- [ ] Advanced filtering and search
- [ ] Image metadata extraction
- [ ] Automated thumbnail generation
- [ ] Image versioning
- [ ] Usage analytics
- [ ] Image approval workflow
- [ ] Mobile app integration