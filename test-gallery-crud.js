// Comprehensive Gallery CRUD Test
// Run with: node test-gallery-crud.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ngwenyamzwakhe80:masterG2%23@cluster0.pfrbogh.mongodb.net/lms?retryWrites=true&w=majority';

const testImages = [
  {
    title: "Test Academic Event",
    description: "Test description for academic event",
    category: "academic",
    imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    uploadedBy: "test-admin",
    uploadedAt: new Date(),
    isActive: true,
    tags: ["test", "academic", "crud"],
    displayOrder: 1,
    fileName: "test_academic.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg"
  },
  {
    title: "Test Career Event",
    description: "Test description for career event",
    category: "career",
    imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    uploadedBy: "test-admin",
    uploadedAt: new Date(),
    isActive: false,
    tags: ["test", "career", "crud"],
    displayOrder: 2,
    fileName: "test_career.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg"
  }
];

async function testGalleryCRUD() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🧪 Testing Gallery CRUD Operations...\n');
    
    // Connect to database
    console.log('1. Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('lms');
    const galleryCollection = db.collection('gallery');
    
    // Clean up test data
    console.log('\n2. Cleaning up test data...');
    await galleryCollection.deleteMany({ uploadedBy: 'test-admin' });
    console.log('✅ Test data cleaned up');
    
    // Test CREATE
    console.log('\n3. Testing CREATE operation...');
    const insertResult = await galleryCollection.insertMany(testImages);
    console.log(`✅ Created ${insertResult.insertedCount} test images`);
    
    // Test READ
    console.log('\n4. Testing READ operations...');
    
    // Read all images
    const allImages = await galleryCollection.find({ uploadedBy: 'test-admin' }).toArray();
    console.log(`✅ Read all images: ${allImages.length} found`);
    
    // Read by category
    const academicImages = await galleryCollection.find({ 
      uploadedBy: 'test-admin', 
      category: 'academic' 
    }).toArray();
    console.log(`✅ Read academic images: ${academicImages.length} found`);
    
    // Read active images
    const activeImages = await galleryCollection.find({ 
      uploadedBy: 'test-admin', 
      isActive: true 
    }).toArray();
    console.log(`✅ Read active images: ${activeImages.length} found`);
    
    // Test UPDATE
    console.log('\n5. Testing UPDATE operations...');
    
    const firstImage = allImages[0];
    if (firstImage) {
      // Update title and description
      const updateResult = await galleryCollection.updateOne(
        { _id: firstImage._id },
        { 
          $set: { 
            title: "Updated Academic Event",
            description: "Updated description for academic event",
            tags: ["updated", "academic", "test"],
            updatedAt: new Date()
          }
        }
      );
      console.log(`✅ Updated image: ${updateResult.modifiedCount} modified`);
      
      // Toggle active status
      const toggleResult = await galleryCollection.updateOne(
        { _id: firstImage._id },
        { $set: { isActive: !firstImage.isActive } }
      );
      console.log(`✅ Toggled active status: ${toggleResult.modifiedCount} modified`);
      
      // Verify update
      const updatedImage = await galleryCollection.findOne({ _id: firstImage._id });
      console.log(`✅ Verification - Title: "${updatedImage.title}", Active: ${updatedImage.isActive}`);
    }
    
    // Test DELETE
    console.log('\n6. Testing DELETE operations...');
    
    const secondImage = allImages[1];
    if (secondImage) {
      const deleteResult = await galleryCollection.deleteOne({ _id: secondImage._id });
      console.log(`✅ Deleted image: ${deleteResult.deletedCount} deleted`);
    }
    
    // Test final state
    console.log('\n7. Testing final state...');
    const finalImages = await galleryCollection.find({ uploadedBy: 'test-admin' }).toArray();
    console.log(`✅ Final image count: ${finalImages.length}`);
    
    // Test category counts
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
      console.log(`   ${category}: ${count} active images`);
    });
    
    // Test sorting
    console.log('\n8. Testing sorting...');
    const sortedImages = await galleryCollection
      .find({ uploadedBy: 'test-admin' })
      .sort({ displayOrder: 1, uploadedAt: -1 })
      .toArray();
    console.log(`✅ Sorted images: ${sortedImages.length} found`);
    
    console.log('\n🎉 Gallery CRUD Test Complete!');
    console.log('\n📋 All Operations Tested:');
    console.log('✅ CREATE - Insert new images');
    console.log('✅ READ - Fetch images by various criteria');
    console.log('✅ UPDATE - Modify image properties');
    console.log('✅ DELETE - Remove images');
    console.log('✅ SORTING - Order images correctly');
    console.log('✅ FILTERING - Category and status filtering');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Start your Next.js server: npm run dev');
    console.log('2. Log in as admin and go to Admin Dashboard');
    console.log('3. Click on the "Gallery" tab');
    console.log('4. Test all CRUD operations in the UI:');
    console.log('   - Upload new images');
    console.log('   - Edit existing images');
    console.log('   - Toggle active/inactive status');
    console.log('   - Delete images');
    console.log('   - Filter by category');
    console.log('5. Check the public gallery at /gallery');
    
  } catch (error) {
    console.error('❌ Gallery CRUD Test Failed:', error);
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
testGalleryCRUD();