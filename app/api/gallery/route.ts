import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GalleryImage from '@/models/GalleryImage';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { imageUrl, category } = await req.json();

    if (!imageUrl || !category) {
      return NextResponse.json(
        { error: 'Image URL and category are required' },
        { status: 400 }
      );
    }

    const newImage = await GalleryImage.create({
      imageUrl,
      category,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Image added successfully', image: newImage },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding image:', error);
    return NextResponse.json(
      { error: 'Failed to add image' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}