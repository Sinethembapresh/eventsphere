import { type NextRequest, NextResponse } from "next/server"
import { withRole } from "@/lib/auth/middleware"

// GET /api/admin/gallery/test - Test database connectivity and gallery collection
export const GET = withRole(["admin"])(
  async (req: NextRequest) => {
    try {
      console.log('[Gallery Test] Starting database connectivity test...')
      
      // Test database connection
      const { getDatabase } = await import("@/lib/mongodb")
      const db = await getDatabase()
      console.log('[Gallery Test] Database connected successfully')
      
      // Test gallery collection
      const galleryCollection = db.collection("gallery")
      console.log('[Gallery Test] Gallery collection accessed')
      
      // Test basic operations
      const totalCount = await galleryCollection.countDocuments({})
      console.log(`[Gallery Test] Total documents in gallery: ${totalCount}`)
      
      // Test category counts
      const categoryCounts = await Promise.all(
        ['academic', 'career', 'cultural', 'social', 'sports', 'technical'].map(async (cat) => {
          const count = await galleryCollection.countDocuments({ 
            category: cat, 
            isActive: true 
          })
          return { category: cat, count }
        })
      )
      
      // Test sample documents
      const sampleDocs = await galleryCollection
        .find({})
        .limit(3)
        .toArray()
      
      console.log(`[Gallery Test] Sample documents:`, sampleDocs.length)
      
      return NextResponse.json({
        success: true,
        message: "Database connectivity test successful",
        data: {
          totalDocuments: totalCount,
          categoryCounts: categoryCounts.reduce((acc, { category, count }) => {
            acc[category] = count
            return acc
          }, {} as Record<string, number>),
          sampleDocuments: sampleDocs.map(doc => ({
            _id: doc._id.toString(),
            title: doc.title,
            category: doc.category,
            isActive: doc.isActive,
            uploadedAt: doc.uploadedAt
          }))
        }
      })
    } catch (error) {
      console.error('[Gallery Test] Database connectivity test failed:', error)
      return NextResponse.json({ 
        success: false,
        error: "Database connectivity test failed", 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }, { status: 500 })
    }
  }
)