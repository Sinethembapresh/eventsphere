
import { type NextRequest, NextResponse } from "next/server"

// GET /api/gallery - Get gallery images for public display
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    // For now, we'll use a simple in-memory storage or file system
    // In production, you'd use a proper database collection
    const galleryCollection = await getGalleryCollection()
    
    let query: any = { isActive: true }
    if (category) {
      query.category = category
    }

    const images = await galleryCollection
      .find(query)
      .sort({ displayOrder: 1, uploadedAt: -1 })
      .limit(limit)
      .toArray()

    // Get category counts for the gallery page
    const categoryCounts = await Promise.all(
      ['academic', 'career', 'cultural', 'social', 'sports', 'technical'].map(async (cat) => {
        const count = await galleryCollection.countDocuments({ 
          category: cat, 
          isActive: true 
        })
        return { category: cat, count }
      })
    )

    return NextResponse.json({
      images: images.map((img: any) => ({
        ...img,
        _id: img._id.toString()
      })),
      categoryCounts: categoryCounts.reduce((acc, { category, count }) => {
        acc[category] = count
        return acc
      }, {} as Record<string, number>)
    })
  } catch (error) {
    console.error("Get gallery images error:", error)
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 })
  }
}

// Helper function to get gallery collection
async function getGalleryCollection() {
  const { getDatabase } = await import("@/lib/database/collections")
  const db = await getDatabase()
  return db.collection("gallery")

}