# Installation Guide

## Prerequisites

1. **Node.js**
   - Version: 18.x or higher
   - Download from: https://nodejs.org/

2. **MongoDB**
   - Version: 6.0 or higher
   - Local installation or MongoDB Atlas account

3. **Git**
   - Latest version
   - Download from: https://git-scm.com/

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/eventsphere.git
cd eventsphere
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install API dependencies
cd sboepress-api-main
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:
```env
# Next.js Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/eventsphere
# or
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventsphere

# JWT
JWT_SECRET=your-jwt-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Database Setup
1. Create MongoDB database
2. Import sample data (optional):
```bash
mongorestore --db eventsphere ./sample-data
```

### 5. Start the Development Server

```bash
# Start the API server
cd sboepress-api-main
npm run dev

# In a new terminal, start the frontend
cd ..
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:5000

## Production Deployment

### 1. Build the Application
```bash
# Build the frontend
npm run build

# Build the API
cd sboepress-api-main
npm run build
```

### 2. Environment Variables
Set the following in your production environment:
```env
NODE_ENV=production
# ... (same as development, but with production values)
```

### 3. Start Production Server
```bash
# Start API
npm run start

# Start frontend
npm run start
```

## Common Issues & Solutions

### MongoDB Connection
If you can't connect to MongoDB:
1. Check if MongoDB is running
2. Verify connection string
3. Check network access settings

### Port Conflicts
If port 3000 is in use:
1. Kill the process using the port
2. Or modify the port in package.json

### Build Errors
If you encounter build errors:
1. Clear .next directory
2. Delete node_modules
3. Run npm install again

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use different values for each environment
   - Regularly rotate secrets

2. **API Access**
   - Use HTTPS in production
   - Implement rate limiting
   - Set up CORS properly

3. **Database**
   - Use strong passwords
   - Enable authentication
   - Regular backups

## Monitoring Setup

1. **Application Monitoring**
   - Set up Vercel Analytics
   - Configure error tracking
   - Monitor performance metrics

2. **Database Monitoring**
   - Enable MongoDB monitoring
   - Set up alerts
   - Regular health checks

## Backup Procedures

1. **Database Backups**
   - Daily automated backups
   - Manual backup before updates
   - Test restore procedures

2. **Application Backups**
   - Version control
   - Configuration backups
   - User data exports