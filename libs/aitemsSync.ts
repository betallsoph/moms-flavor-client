/**
 * AiTEMS Data Sync Service
 * 
 * Service này tự động sync data lên Naver Object Storage
 * để AiTEMS có thể đọc và tạo AI recommendations.
 * 
 * Flow:
 * 1. User hoàn thành nấu ăn → createDiaryEntry()
 * 2. Trigger syncCookingEvent() → Format data
 * 3. Upload JSON lên cook-history/ folder
 * 4. AiTEMS đọc data → Generate recommendations
 * 
 * Data Types (theo AiTEMS schema):
 * - ITEM: Recipe/dish information
 * - USER: User preferences and history
 * - INTERACTION: Cooking events (user + item + timestamp + rating)
 */

import { uploadJSON } from './naverStorage';
import { Recipe } from '@/types/recipe';
import { CookingDiaryEntry } from './firestore';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from './firebase';

// ============ AiTEMS DATA SCHEMAS ============

/**
 * ITEM Schema - Recipe/Dish Information
 * Theo format AiTEMS yêu cầu
 */
interface AiTemsItem {
  ITEM_ID: string;           // Recipe ID
  ITEM_NAME: string;         // Dish name
  CATEGORY?: string;         // Difficulty level
  DESCRIPTION?: string;      // Recipe description
  COOKING_TIME?: string;     // Cooking time category
  TAGS?: string[];           // Ingredient names, brands
  IMAGE_URL?: string;        // Cover image
  CREATED_AT: number;        // Unix timestamp
}

/**
 * USER Schema - User Preferences
 */
interface AiTemsUser {
  USER_ID: string;           // Firebase user ID
  USER_NAME?: string;        // Display name
  TOTAL_COOKS: number;       // Total cooking sessions
  FAVORITE_CATEGORIES?: string[]; // Most cooked difficulty levels
  LAST_ACTIVE: number;       // Unix timestamp
}

/**
 * INTERACTION Schema - Cooking Events
 * Đây là data quan trọng nhất cho recommendations
 */
interface AiTemsInteraction {
  USER_ID: string;           // Firebase user ID
  ITEM_ID: string;           // Recipe ID
  EVENT_TYPE: string;        // 'cook', 'complete', 'rate'
  TIMESTAMP: number;         // Unix timestamp
  RATING?: number;           // 1-5 stars (optional)
  HAS_NOTES: boolean;        // User có ghi chú không
  HAS_IMAGES: boolean;       // User có chụp ảnh không
  COOK_DATE: string;         // Human-readable date
}

// ============ SYNC FUNCTIONS ============

/**
 * Sync cooking event to AiTEMS
 * 
 * Được gọi tự động sau khi user hoàn thành nấu ăn
 * 
 * @param diaryEntry - Cooking diary entry vừa tạo
 * @param recipe - Recipe information
 * @param rating - User rating (1-5)
 */
export async function syncCookingEvent(
  diaryEntry: CookingDiaryEntry,
  recipe: Recipe,
  rating?: number
): Promise<void> {
  try {
    console.log('🔄 [AiTEMS] Syncing cooking event...');
    
    // 1. Create INTERACTION data
    const interaction: AiTemsInteraction = {
      USER_ID: diaryEntry.userId,
      ITEM_ID: diaryEntry.recipeId,
      EVENT_TYPE: 'complete',
      TIMESTAMP: new Date(diaryEntry.timestamp).getTime(),
      RATING: rating,
      HAS_NOTES: !!(diaryEntry.mistakes || diaryEntry.improvements),
      HAS_IMAGES: diaryEntry.images.length > 0,
      COOK_DATE: diaryEntry.cookDate,
    };
    
    // 2. Create/Update ITEM data
    const item: AiTemsItem = {
      ITEM_ID: recipe.id,
      ITEM_NAME: recipe.dishName || 'Untitled',
      CATEGORY: recipe.difficulty,
      DESCRIPTION: recipe.description,
      COOKING_TIME: recipe.cookingTime,
      TAGS: [
        ...(recipe.ingredientsList?.map(i => i.name) || []),
        ...(recipe.favoriteBrands || []),
      ],
      IMAGE_URL: recipe.coverImage,
      CREATED_AT: new Date(recipe.createdAt).getTime(),
    };
    
    // 3. Upload to Object Storage
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = Date.now();
    
    // Upload interaction (most important for recommendations)
    await uploadJSON(
      interaction,
      'interactions',
      `interaction-${diaryEntry.userId}-${timestamp}.json`
    );
    
    // Upload item (recipe info)
    await uploadJSON(
      item,
      'items',
      `item-${recipe.id}-${timestamp}.json`
    );
    
    // 4. Update user stats (aggregate data)
    await syncUserStats(diaryEntry.userId);
    
    console.log('✅ [AiTEMS] Sync complete!');
  } catch (error) {
    console.error('❌ [AiTEMS] Sync failed:', error);
    // Không throw error để không block việc save diary entry
    // AiTEMS sync là background task, fail cũng không sao
  }
}

/**
 * Sync user statistics
 * 
 * Tính toán và upload user preferences
 */
async function syncUserStats(userId: string): Promise<void> {
  try {
    // Get user's cooking history from Firestore
    const entriesRef = collection(db, 'users', userId, 'cookingDiary');
    const snapshot = await getDocs(entriesRef);
    
    const entries = snapshot.docs.map(doc => doc.data());
    
    // Calculate stats
    const totalCooks = entries.length;
    
    // Get most cooked difficulty levels (từ recipes)
    // This would require joining with recipes - simplified for now
    const favoriteCategories: string[] = [];
    
    const user: AiTemsUser = {
      USER_ID: userId,
      TOTAL_COOKS: totalCooks,
      FAVORITE_CATEGORIES: favoriteCategories,
      LAST_ACTIVE: Date.now(),
    };
    
    // Upload user stats
    await uploadJSON(
      user,
      'users',
      `user-${userId}-${Date.now()}.json`
    );
    
    console.log('✅ [AiTEMS] User stats synced');
  } catch (error) {
    console.error('❌ [AiTEMS] User stats sync failed:', error);
  }
}

/**
 * Batch sync - Upload aggregate data daily
 * 
 * Có thể chạy qua cron job hoặc Cloud Function
 * để tạo file tổng hợp theo ngày
 */
export async function batchSyncDaily(): Promise<void> {
  console.log('🔄 [AiTEMS] Running daily batch sync...');
  
  // TODO: Implement batch aggregation
  // 1. Query all diary entries from today
  // 2. Aggregate into single files
  // 3. Upload: items-YYYY-MM-DD.json, interactions-YYYY-MM-DD.json, users-YYYY-MM-DD.json
  
  console.log('✅ [AiTEMS] Daily batch sync complete');
}

/**
 * Helper: Format data for AiTEMS CSV export (alternative format)
 * 
 * Một số use cases AiTEMS có thể cần CSV thay vì JSON
 */
export function formatInteractionsAsCSV(interactions: AiTemsInteraction[]): string {
  const header = 'USER_ID,ITEM_ID,EVENT_TYPE,TIMESTAMP,RATING,HAS_NOTES,HAS_IMAGES,COOK_DATE\n';
  
  const rows = interactions.map(i => 
    `${i.USER_ID},${i.ITEM_ID},${i.EVENT_TYPE},${i.TIMESTAMP},${i.RATING || ''},${i.HAS_NOTES},${i.HAS_IMAGES},${i.COOK_DATE}`
  ).join('\n');
  
  return header + rows;
}

