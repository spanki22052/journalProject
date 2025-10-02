const { MinIOService } = require('../dist/src/infra/minio.js');
const fs = require('fs');
const path = require('path');

async function testMinIOAccess() {
  console.log('🧪 Testing MinIO Public Access...\n');
  
  const minioService = new MinIOService();
  
  try {
    // Initialize MinIO connection
    await minioService.initialize();
    console.log('✅ MinIO connection successful');
    
    // Create a test file
    const testContent = 'Hello MinIO Public Access!';
    const testFileName = `test-file-${Date.now()}.txt`;
    
    console.log(`📤 Uploading test file: ${testFileName}`);
    const objectName = await minioService.uploadFile(
      Buffer.from(testContent), 
      testFileName, 
      'text/plain'
    );
    console.log(`✅ File uploaded successfully: ${objectName}`);
    
    // Get public URL
    console.log('🔗 Getting public URL...');
    const publicUrl = await minioService.getFileUrl(objectName);
    console.log(`🌐 Public URL: ${publicUrl}`);
    
    // Test if the file is publicly accessible
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        const fileContent = await response.text();
        console.log(`✅ File is publicly accessible!`);
        console.log(`📄 Content: ${fileContent}`);
        
        // Test if it matches original content
        if (fileContent === testContent) {
          console.log(`✅ Content verification successful!`);
        } else {
          console.log(`❌ Content mismatch!`);
        }
      } else {
        console.log(`❌ File not publicly accessible. Status: ${response.status}`);
        console.log(`📝 Response: ${await response.text()}`);
      }
    } catch (fetchError) {
      console.log(`❌ Error fetching public URL: ${fetchError.message}`);
    }
    
    // Clean up test file
    console.log('🗑️ Cleaning up test file...');
    await minioService.deleteFile(objectName);
    console.log('✅ Test file deleted');
    
    console.log('\n🎉 MinIO Public Access Test Completed!');
    
  } catch (error) {
    console.error('❌ MinIO Test Failed:', error);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  testMinIOAccess();
}

module.exports = { testMinIOAccess };
