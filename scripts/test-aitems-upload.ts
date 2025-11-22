/**
 * Test Script: Upload Sample Data to cook-history
 * 
 * Run: npx ts-node scripts/test-aitems-upload.ts
 */

import { uploadJSON } from '../libs/naverStorage';

async function testAiTemsUpload() {
  console.log('🧪 Testing AiTEMS Data Upload...\n');
  
  try {
    // 1. Sample INTERACTION data
    const sampleInteraction = {
      USER_ID: 'test-user-123',
      ITEM_ID: 'recipe-pho-bo',
      EVENT_TYPE: 'complete',
      TIMESTAMP: Date.now(),
      RATING: 5,
      HAS_NOTES: true,
      HAS_IMAGES: true,
      COOK_DATE: new Date().toLocaleDateString('vi-VN'),
    };
    
    console.log('📤 Uploading INTERACTION data...');
    const interactionUrl = await uploadJSON(
      sampleInteraction,
      'interactions',
      `interaction-test-${Date.now()}.json`
    );
    console.log('✅ Interaction URL:', interactionUrl, '\n');
    
    // 2. Sample ITEM data
    const sampleItem = {
      ITEM_ID: 'recipe-pho-bo',
      ITEM_NAME: 'Phở Bò Hà Nội',
      CATEGORY: 'medium',
      DESCRIPTION: 'Món phở truyền thống Hà Nội với nước dùng hầm xương 6 tiếng',
      COOKING_TIME: 'slow',
      TAGS: ['beef', 'rice noodles', 'star anise', 'cinnamon', 'ginger', 'onion'],
      IMAGE_URL: 'https://example.com/pho.jpg',
      CREATED_AT: Date.now(),
    };
    
    console.log('📤 Uploading ITEM data...');
    const itemUrl = await uploadJSON(
      sampleItem,
      'items',
      `item-test-${Date.now()}.json`
    );
    console.log('✅ Item URL:', itemUrl, '\n');
    
    // 3. Sample USER data
    const sampleUser = {
      USER_ID: 'test-user-123',
      TOTAL_COOKS: 15,
      FAVORITE_CATEGORIES: ['easy', 'medium'],
      LAST_ACTIVE: Date.now(),
    };
    
    console.log('📤 Uploading USER data...');
    const userUrl = await uploadJSON(
      sampleUser,
      'users',
      `user-test-${Date.now()}.json`
    );
    console.log('✅ User URL:', userUrl, '\n');
    
    console.log('🎉 All test uploads successful!\n');
    console.log('📂 Check your Naver Object Storage:');
    console.log('   Bucket: moms-flavor-media');
    console.log('   Folder: cook-history/');
    console.log('   Files:');
    console.log('   - interactions/interaction-test-*.json');
    console.log('   - items/item-test-*.json');
    console.log('   - users/user-test-*.json');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test
testAiTemsUpload();

