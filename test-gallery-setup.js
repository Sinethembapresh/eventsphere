// Comprehensive Gallery System Test and Setup
// Run with: node test-gallery-setup.js

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

async function testGallerySystem() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🧪 Testing Gallery Management System...\n');
    
    // Test 1: Database Connection
    console.log('1. Testing Database Connection...');
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db('lms');
    const galleryCollection = db.collection('gallery');
    
    // Test 2: Collection Access
    console.log('\n2. Testing Gallery Collection Access...');
    const totalCount = await galleryCollection.countDocuments({});
    console.log(`✅ Gallery collection accessible - ${totalCount} existing documents`);
    
    // Test 3: Clear Test Data
    console.log('\n3. Clearing existing test data...');
    const deleteResult = await galleryCollection.deleteMany({ uploadedBy: 'admin' });
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing test documents`);
    
    // Test 4: Insert Test Images
    console.log('\n4. Inserting test images...');
    const insertResult = await galleryCollection.insertMany(testImages);
    console.log(`✅ Inserted ${insertResult.insertedCount} test images`);
    
    // Test 5: Verify Data
    console.log('\n5. Verifying inserted data...');
    const newTotalCount = await galleryCollection.countDocuments({});
    console.log(`✅ Total images in gallery: ${newTotalCount}`);
    
    // Test 6: Category Counts
    console.log('\n6. Testing category counts...');
    const categoryCounts = await Promise.all(
      ['academic', 'career', 'cultural', 'social', 'sports', 'technical'].map(async (cat) => {
        const count = await galleryCollection.countDocuments({ 
          category: cat, 
          isActive: true 
        });
        return { category: cat, count };
      })
    );
    
    console.log('✅ Category counts:');
    categoryCounts.forEach(({ category, count }) => {
      console.log(`   ${category}: ${count} images`);
    });
    
    // Test 7: Query Test
    console.log('\n7. Testing queries...');
    const academicImages = await galleryCollection
      .find({ category: 'academic', isActive: true })
      .sort({ displayOrder: 1, uploadedAt: -1 })
      .toArray();
    console.log(`✅ Academic images query: ${academicImages.length} results`);
    
    // Test 8: Sample Data
    console.log('\n8. Sample data structure:');
    const sampleImage = await galleryCollection.findOne({});
    if (sampleImage) {
      console.log('✅ Sample image structure:');
      console.log(`   Title: ${sampleImage.title}`);
      console.log(`   Category: ${sampleImage.category}`);
      console.log(`   Tags: ${sampleImage.tags?.join(', ') || 'None'}`);
      console.log(`   Uploaded: ${sampleImage.uploadedAt}`);
      console.log(`   Active: ${sampleImage.isActive}`);
    }
    
    console.log('\n🎉 Gallery System Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start your Next.js server: npm run dev');
    console.log('2. Log in as admin and go to Admin Dashboard');
    console.log('3. Click on the "Gallery" tab');
    console.log('4. Click "Show Debug" to see system information');
    console.log('5. Click "Test Database" to verify connectivity');
    console.log('6. Try uploading new images and filtering by category');
    console.log('7. Check the public gallery page at /gallery');
    
  } catch (error) {
    console.error('❌ Gallery System Test Failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check MongoDB connection string');
    console.log('2. Ensure MongoDB is running and accessible');
    console.log('3. Verify database permissions');
    console.log('4. Check network connectivity');
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testGallerySystem();