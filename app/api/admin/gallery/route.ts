import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection, getGalleryCollection } from "@/lib/database/collections"
import { withRole } from "@/lib/auth/middleware"
import { ObjectId } from "mongodb"
import type { GalleryMedia } from "@/lib/models/GalleryMedia"

// GET /api/admin/gallery - Get all gallery images
export const GET = withRole(["admin"])(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url)
      const category = searchParams.get('category')
      const limit = parseInt(searchParams.get('limit') || '100')
      const offset = parseInt(searchParams.get('offset') || '0')

      console.log(`[Gallery API] Fetching images - Category: ${category}, Limit: ${limit}, Offset: ${offset}`)

      const galleryCollection = await getGalleryCollection()
      
      // Build query
      let query: any = { isActive: true }
      if (category && category !== 'all') {
        query.category = category
      }

      console.log(`[Gallery API] Query:`, query)

      // Get images with pagination
      const images = await galleryCollection
        .find(query)
        .sort({ displayOrder: 1, uploadedAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray()

      console.log(`[Gallery API] Found ${images.length} images`)

      // Get total count for pagination
      const totalCount = await galleryCollection.countDocuments(query)

      // Get category counts for filter buttons
      const categoryCounts = await Promise.all(
        ['academic', 'career', 'cultural', 'social', 'sports', 'technical'].map(async (cat) => {
          const count = await galleryCollection.countDocuments({ 
            category: cat, 
            isActive: true 
          })
          return { category: cat, count }
        })
      )

      const result = {
        images: images.map(img => ({
          ...img,
          _id: img._id.toString()
        })),
        totalCount,
        hasMore: offset + images.length < totalCount,
        categoryCounts: categoryCounts.reduce((acc, { category, count }) => {
          acc[category] = count
          return acc
        }, {} as Record<string, number>)
      }

      console.log(`[Gallery API] Returning ${result.images.length} images, total: ${result.totalCount}`)
      return NextResponse.json(result)
    } catch (error) {
      console.error("Get gallery images error:", error)
      return NextResponse.json({ 
        error: "Failed to fetch gallery images", 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }
)

// POST /api/admin/gallery - Upload new gallery image
export const POST = withRole(["admin"])(
  async (req: NextRequest, user) => {
    try {
      const formData = await req.formData()
      const title = formData.get('title') as string
      const description = formData.get('description') as string
      const category = formData.get('category') as string
      const file = formData.get('file') as File
      const tags = formData.get('tags') as string

      if (!title || !category || !file) {
        return NextResponse.json({ 
          error: "Title, category, and file are required" 
        }, { status: 400 })
      }

      const validCategories = ['academic', 'career', 'cultural', 'social', 'sports', 'technical']
      if (!validCategories.includes(category)) {
        return NextResponse.json({ 
          error: "Invalid category" 
        }, { status: 400 })
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ 
          error: "Only image files are allowed" 
        }, { status: 400 })
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "File size must be less than 10MB" 
        }, { status: 400 })
      }

      const users = await getUsersCollection()
      const userId = (user as any).userId || (user as any).id || (user as any)._id

      // Create a unique filename to avoid conflicts
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop() || 'jpg'
      const fileName = `${category}_${timestamp}.${fileExtension}`
      
      // For now, we'll create a base64 data URL
      // In production, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const imageUrl = `data:${file.type};base64,${base64}`

      const galleryCollection = await getGalleryCollection()
      
      // Get the next display order for this category
      const lastImage = await galleryCollection
        .findOne(
          { category, isActive: true },
          { sort: { displayOrder: -1 } }
        )
      const nextDisplayOrder = (lastImage?.displayOrder || 0) + 1
      
      const galleryItem: Omit<GalleryMedia, "_id"> = {
        title: title.trim(),
        description: description?.trim() || '',
        category: category as GalleryMedia['category'],
        imageUrl,
        thumbnailUrl: imageUrl, // For now, same as main image
        uploadedBy: userId,
        uploadedAt: new Date(),
        isActive: true,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
        displayOrder: nextDisplayOrder,
        fileName: fileName,
        fileSize: file.size,
        mimeType: file.type
      }

      const result = await galleryCollection.insertOne(galleryItem)

      return NextResponse.json({
        message: "Image uploaded successfully",
        image: {
          ...galleryItem,
          _id: result.insertedId.toString()
        }
      })
    } catch (error) {
      console.error("Upload gallery image error:", error)
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }
  }
)

// PUT /api/admin/gallery - Update gallery image
export const PUT = withRole(["admin"])(
  async (req: NextRequest) => {
    try {
      const { imageId, title, description, category, tags, isActive } = await req.json()

      if (!imageId) {
        return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
      }

      const validCategories = ['academic', 'career', 'cultural', 'social', 'sports', 'technical']
      if (category && !validCategories.includes(category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 })
      }

      const galleryCollection = await getGalleryCollection()
      
      const updateData: any = {}
      if (title !== undefined) updateData.title = title.trim()
      if (description !== undefined) updateData.description = description.trim()
      if (category !== undefined) updateData.category = category
      if (tags !== undefined) updateData.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
      if (isActive !== undefined) updateData.isActive = isActive
      updateData.updatedAt = new Date()

      const result = await galleryCollection.updateOne(
        { _id: new ObjectId(imageId) },
        { $set: updateData }
      )

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 })
      }

      return NextResponse.json({ 
        message: "Image updated successfully",
        modified: result.modifiedCount > 0
      })
    } catch (error) {
      console.error("Update gallery image error:", error)
      return NextResponse.json({ error: "Failed to update image" }, { status: 500 })
    }
  }
)

// DELETE /api/admin/gallery - Delete gallery image
export const DELETE = withRole(["admin"])(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url)
      const imageId = searchParams.get('id')

      if (!imageId) {
        return NextResponse.json({ error: "Image ID is required" }, { status: 400 })
      }

      const galleryCollection = await getGalleryCollection()
      
      const result = await galleryCollection.deleteOne({ 
        _id: new ObjectId(imageId) 
      })

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 })
      }

      return NextResponse.json({ message: "Image deleted successfully" })
    } catch (error) {
      console.error("Delete gallery image error:", error)
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }
  }
)
