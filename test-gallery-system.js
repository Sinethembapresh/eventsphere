// Test script for Gallery Management System
// Run this with: node test-gallery-system.js

const testGallerySystem = async () => {
  console.log('🧪 Testing Gallery Management System...\n');

  // Test 1: Check if admin gallery API is accessible
  console.log('1. Testing Admin Gallery API...');
  try {
    const response = await fetch('http://localhost:3000/api/admin/gallery', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token', // This will fail auth, but we can check if endpoint exists
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.log('✅ Admin Gallery API endpoint exists (authentication required)');
    } else {
      console.log(`⚠️  Admin Gallery API returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Admin Gallery API not accessible:', error.message);
  }

  // Test 2: Check if public gallery API is accessible
  console.log('\n2. Testing Public Gallery API...');
  try {
    const response = await fetch('http://localhost:3000/api/gallery');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Public Gallery API accessible');
      console.log(`   - Images count: ${data.images?.length || 0}`);
      console.log(`   - Category counts:`, data.categoryCounts || {});
    } else {
      console.log(`⚠️  Public Gallery API returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Public Gallery API not accessible:', error.message);
  }

  // Test 3: Check if gallery page is accessible
  console.log('\n3. Testing Gallery Page...');
  try {
    const response = await fetch('http://localhost:3000/gallery');
    
    if (response.ok) {
      console.log('✅ Gallery page accessible');
    } else {
      console.log(`⚠️  Gallery page returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Gallery page not accessible:', error.message);
  }

  // Test 4: Check if admin dashboard is accessible
  console.log('\n4. Testing Admin Dashboard...');
  try {
    const response = await fetch('http://localhost:3000/admin/dashboard');
    
    if (response.ok) {
      console.log('✅ Admin dashboard accessible');
    } else {
      console.log(`⚠️  Admin dashboard returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Admin dashboard not accessible:', error.message);
  }

  console.log('\n🎯 Gallery System Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start your Next.js development server: npm run dev');
  console.log('2. Log in as admin and go to Admin Dashboard');
  console.log('3. Click on the "Gallery" tab');
  console.log('4. Upload some test images with different categories');
  console.log('5. Check the public gallery page to see uploaded images');
};

// Run the test
testGallerySystem().catch(console.error);