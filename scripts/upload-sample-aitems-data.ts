/**
 * Upload Sample AiTEMS Data
 *
 * Script này tạo sample data để test AiTEMS recommendations
 * Run: npx tsx scripts/upload-sample-aitems-data.ts
 */

import { uploadJSON } from '../libs/naverStorage';

async function uploadSampleData() {
  console.log('🚀 Starting AiTEMS sample data upload...\n');

  try {
    // Sample User IDs (replace with your actual Firebase user IDs if needed)
    const userIds = ['user-001', 'user-002', 'user-003'];

    // Sample Recipe IDs (replace with your actual recipe IDs from Firestore)
    const recipes = [
      { id: 'recipe-pho-bo', name: 'Phở Bò', difficulty: 'medium', time: 'slow' },
      { id: 'recipe-com-tam', name: 'Cơm Tấm', difficulty: 'easy', time: 'fast' },
      { id: 'recipe-bun-cha', name: 'Bún Chả', difficulty: 'medium', time: 'medium' },
      { id: 'recipe-banh-mi', name: 'Bánh Mì', difficulty: 'easy', time: 'fast' },
      { id: 'recipe-goi-cuon', name: 'Gỏi Cuốn', difficulty: 'very_easy', time: 'very_fast' },
      { id: 'recipe-canh-chua', name: 'Canh Chua', difficulty: 'easy', time: 'fast' },
      { id: 'recipe-bo-luc-lac', name: 'Bò Lúc Lắc', difficulty: 'medium', time: 'fast' },
      { id: 'recipe-ga-kho-gung', name: 'Gà Kho Gừng', difficulty: 'medium', time: 'medium' },
    ];

    // 1. Upload ITEMS (Recipes)
    console.log('📦 Uploading ITEMS (Recipes)...');
    for (const recipe of recipes) {
      const item = {
        ITEM_ID: recipe.id,
        ITEM_NAME: recipe.name,
        CATEGORY: recipe.difficulty,
        DESCRIPTION: `Món ${recipe.name} truyền thống Việt Nam`,
        COOKING_TIME: recipe.time,
        TAGS: ['vietnamese', 'traditional', recipe.name.toLowerCase()],
        IMAGE_URL: `https://example.com/${recipe.id}.jpg`,
        CREATED_AT: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Random trong 30 ngày qua
      };

      await uploadJSON(item, 'items', `item-${recipe.id}-${Date.now()}.json`);
      console.log(`  ✅ Uploaded: ${recipe.name}`);
    }

    // 2. Upload INTERACTIONS (Cooking Events)
    console.log('\n🔥 Uploading INTERACTIONS (Cooking Events)...');
    let interactionCount = 0;

    // Generate realistic cooking patterns
    for (const userId of userIds) {
      // Each user cooks 5-10 random recipes
      const numCooks = 5 + Math.floor(Math.random() * 6);
      const shuffledRecipes = [...recipes].sort(() => 0.5 - Math.random());
      const cookedRecipes = shuffledRecipes.slice(0, numCooks);

      for (let i = 0; i < cookedRecipes.length; i++) {
        const recipe = cookedRecipes[i];
        const daysAgo = Math.floor(Math.random() * 30); // Random trong 30 ngày qua
        const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

        const interaction = {
          USER_ID: userId,
          ITEM_ID: recipe.id,
          EVENT_TYPE: 'complete',
          TIMESTAMP: timestamp,
          RATING: 3 + Math.floor(Math.random() * 3), // Rating 3-5
          HAS_NOTES: Math.random() > 0.5,
          HAS_IMAGES: Math.random() > 0.3,
          COOK_DATE: new Date(timestamp).toLocaleDateString('vi-VN'),
        };

        await uploadJSON(
          interaction,
          'interactions',
          `interaction-${userId}-${timestamp}.json`
        );

        interactionCount++;
        console.log(`  ✅ ${userId} nấu ${recipe.name} (${daysAgo} ngày trước) - Rating: ${interaction.RATING}`);
      }
    }

    // 3. Upload USERS (User Stats)
    console.log('\n👥 Uploading USERS (User Stats)...');
    for (const userId of userIds) {
      const user = {
        USER_ID: userId,
        TOTAL_COOKS: 5 + Math.floor(Math.random() * 6),
        FAVORITE_CATEGORIES: ['easy', 'medium'],
        LAST_ACTIVE: Date.now(),
      };

      await uploadJSON(user, 'users', `user-${userId}-${Date.now()}.json`);
      console.log(`  ✅ Uploaded stats for ${userId}`);
    }

    console.log('\n🎉 Upload hoàn tất!');
    console.log(`📊 Tổng kết:`);
    console.log(`   - ${recipes.length} recipes`);
    console.log(`   - ${interactionCount} cooking interactions`);
    console.log(`   - ${userIds.length} users`);
    console.log('\n📂 Check Naver Object Storage:');
    console.log('   Bucket: moms-flavor-media');
    console.log('   Folder: cook-history/');
    console.log('   - cook-history/items/');
    console.log('   - cook-history/interactions/');
    console.log('   - cook-history/users/');
    console.log('\n✅ Bây giờ bạn có thể import data vào AiTEMS và train model!');

  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

// Run upload
uploadSampleData();
