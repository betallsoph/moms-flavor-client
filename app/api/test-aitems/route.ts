/**
 * Test API Route: Upload Sample Data to cook-history
 * 
 * Visit: http://localhost:3002/api/test-aitems
 */

import { NextResponse } from 'next/server';
import { uploadJSON } from '@/libs/naverStorage';

export async function GET() {
  try {
    console.log('🧪 Testing AiTEMS Data Upload...');
    
    const timestamp = Date.now();
    const results: any = {
      success: true,
      uploads: [],
    };
    
    // 1. Sample INTERACTION data
    const sampleInteraction = {
      USER_ID: 'test-user-456',
      ITEM_ID: 'recipe-bun-cha',
      EVENT_TYPE: 'complete',
      TIMESTAMP: timestamp,
      RATING: 4,
      HAS_NOTES: true,
      HAS_IMAGES: false,
      COOK_DATE: new Date().toLocaleDateString('vi-VN'),
    };
    
    console.log('📤 Uploading INTERACTION data...');
    const interactionUrl = await uploadJSON(
      sampleInteraction,
      'interactions',
      `interaction-test-${timestamp}.json`
    );
    results.uploads.push({
      type: 'interaction',
      url: interactionUrl,
      data: sampleInteraction,
    });
    
    // 2. Sample ITEM data
    const sampleItem = {
      ITEM_ID: 'recipe-bun-cha',
      ITEM_NAME: 'Bún Chả Hà Nội',
      CATEGORY: 'easy',
      DESCRIPTION: 'Món ăn đặc sản Hà Nội với thịt nướng thơm ngon',
      COOKING_TIME: 'fast',
      TAGS: ['pork', 'grilled', 'rice noodles', 'herbs', 'fish sauce'],
      IMAGE_URL: 'https://example.com/bun-cha.jpg',
      CREATED_AT: timestamp,
    };
    
    console.log('📤 Uploading ITEM data...');
    const itemUrl = await uploadJSON(
      sampleItem,
      'items',
      `item-test-${timestamp}.json`
    );
    results.uploads.push({
      type: 'item',
      url: itemUrl,
      data: sampleItem,
    });
    
    // 3. Sample USER data
    const sampleUser = {
      USER_ID: 'test-user-456',
      TOTAL_COOKS: 23,
      FAVORITE_CATEGORIES: ['easy', 'medium', 'fast'],
      LAST_ACTIVE: timestamp,
    };
    
    console.log('📤 Uploading USER data...');
    const userUrl = await uploadJSON(
      sampleUser,
      'users',
      `user-test-${timestamp}.json`
    );
    results.uploads.push({
      type: 'user',
      url: userUrl,
      data: sampleUser,
    });
    
    console.log('✅ All test uploads successful!');
    
    return NextResponse.json({
      message: '🎉 Test uploads successful!',
      timestamp: new Date().toISOString(),
      bucket: 'moms-flavor-media',
      folder: 'cook-history/',
      ...results,
    });
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Upload failed',
        details: error,
      },
      { status: 500 }
    );
  }
}

