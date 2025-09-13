// Script to populate gallery with test images
// Run with: node scripts/populate-gallery.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ngwenyamzwakhe80:masterG2%23@cluster0.pfrbogh.mongodb.net/lms?retryWrites=true&w=majority';

const testImages = [
  {
    title: "Academic Conference 2024",
    description: "Students presenting research at the annual academic conference",
    category: "academic",
    imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    uploadedBy: "admin",
    uploadedAt: new Date(),
    isActive: true,
    tags: ["conference", "research", "students"],
    displayOrder: 1,
    fileName: "academic_conference_2024.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg"
  },
  {
    title: "Career Fair 2024",
    description: "Students networking with potential employers",
    category: "career",
    imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    uploadedBy: "admin",
    uploadedAt: new Date(),
    isActive: true,
    tags: ["career", "networking", "employment"],
    displayOrder: 1,
    fileName: "career_fair_2024.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg"
  },
  {
    title: "Cultural Festival",
    description: "Traditional dance performance at cultural festival",
    category: "cultural",
    imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    uploadedBy: "admin",
    uploadedAt: new Date(),
    isActive: true,
    tags: ["festival", "dance", "tradition"],
    displayOrder: 1,
    fileName: "cultural_festival_2024.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg"
  },
  {
    title: "Social Mixer Event",
    description: "Students socializing at the campus mixer",
    category: "social",
    imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    uploadedBy: "admin",
    uploadedAt: new Date(),
    isActive: true,
    tags: ["social", "mixer", "campus"],
    displayOrder: 1,
    fileName: "social_mixer_2024.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg"
  },
  {
    title: "Sports Tournament",
    description: "Basketball championship game",
    category: "sports",
    imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    uploadedBy: "admin",
    uploadedAt: new Date(),
    isActive: true,
    tags: ["basketball", "tournament", "championship"],
    displayOrder: 1,
    fileName: "sports_tournament_2024.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg"
  },
  {
    title: "Tech Hackathon",
    description: "Students coding during the 24-hour hackathon",
    category: "technical",
    imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    uploadedBy: "admin",
    uploadedAt: new Date(),
    isActive: true,
    tags: ["hackathon", "coding", "technology"],
    displayOrder: 1,
    fileName: "tech_hackathon_2024.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg"
  }
];

async function populateGallery() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('lms');
    const galleryCollection = db.collection('gallery');
    
    // Clear existing test data
    console.log('Clearing existing test data...');
    await galleryCollection.deleteMany({ uploadedBy: 'admin' });
    
    // Insert test images
    console.log('Inserting test images...');
    const result = await galleryCollection.insertMany(testImages);
    console.log(`Inserted ${result.insertedCount} test images`);
    
    // Verify insertion
    const count = await galleryCollection.countDocuments({});
    console.log(`Total images in gallery: ${count}`);
    
    const categoryCounts = await Promise.all(
      ['academic', 'career', 'cultural', 'social', 'sports', 'technical'].map(async (cat) => {
        const count = await galleryCollection.countDocuments({ category: cat });
        return { category: cat, count };
      })
    );
    
    console.log('Category counts:');
    categoryCounts.forEach(({ category, count }) => {
      console.log(`  ${category}: ${count}`);
    });
    
    console.log('✅ Gallery populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating gallery:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

populateGallery();