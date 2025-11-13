/**
 * AiTEMS Recommendations API Route
 * 
 * Endpoint: GET /api/recommendations?userId={userId}&count={count}
 * 
 * Returns: AI-powered recipe recommendations based on user's cooking history
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import type { Recipe } from '@/types/recipe';

/**
 * Call Naver AiTEMS API for recommendations
 */
async function getAiTemsRecommendations(
  userId: string,
  count: number = 10
): Promise<{ itemId: string; score: number }[]> {
  const apiUrl = process.env.NAVER_AITEMS_API_URL;
  const serviceId = process.env.NAVER_AITEMS_SERVICE_ID;
  const apiKeyId = process.env.NAVER_AITEMS_API_KEY_ID;
  const apiKeySecret = process.env.NAVER_AITEMS_API_KEY_SECRET;
  
  // Validate env vars
  if (!apiUrl || !serviceId || !apiKeyId || !apiKeySecret) {
    throw new Error('AiTEMS credentials not configured. Check .env.local');
  }
  
  const endpoint = `${apiUrl}/v1/services/${serviceId}/recommend`;
  const params = new URLSearchParams({
    userId,
    count: count.toString(),
  });
  
  console.log('🤖 [AiTEMS] Calling API:', `${endpoint}?${params}`);
  
  try {
    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'x-ncp-apigw-api-key-id': apiKeyId,
        'x-ncp-apigw-api-key': apiKeySecret,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [AiTEMS] API Error:', error);
      throw new Error(`AiTEMS API failed: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    console.log('✅ [AiTEMS] Got recommendations:', data);
    
    return data.recommendations || [];
  } catch (error: any) {
    console.error('❌ [AiTEMS] Request failed:', error);
    throw error;
  }
}

/**
 * Fetch full recipe details from Firestore
 */
async function getRecipesByIds(
  userId: string,
  recipeIds: string[]
): Promise<Recipe[]> {
  if (recipeIds.length === 0) return [];
  
  try {
    const recipesRef = collection(db, 'users', userId, 'recipes');
    const q = query(recipesRef, where('__name__', 'in', recipeIds));
    const snapshot = await getDocs(q);
    
    const recipes: Recipe[] = [];
    snapshot.forEach((doc) => {
      recipes.push({ id: doc.id, ...doc.data() } as Recipe);
    });
    
    return recipes;
  } catch (error) {
    console.error('❌ Error fetching recipes from Firestore:', error);
    return [];
  }
}

/**
 * GET /api/recommendations
 * 
 * Query params:
 * - userId (required): Firebase user ID
 * - count (optional): Number of recommendations (default: 10)
 * - fallback (optional): If true, return popular recipes when AI fails
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');
    const count = parseInt(searchParams.get('count') || '10');
    const useFallback = searchParams.get('fallback') === 'true';
    
    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    console.log(`🤖 [Recommendations] Request for user: ${userId}, count: ${count}`);
    
    let recommendations: { itemId: string; score: number }[] = [];
    let source = 'aitems';
    
    // Try AiTEMS first
    try {
      recommendations = await getAiTemsRecommendations(userId, count);
    } catch (error) {
      console.warn('⚠️ [AiTEMS] Failed, using fallback strategy');
      source = 'fallback';
      
      if (!useFallback) {
        // Return error if fallback is disabled
        return NextResponse.json(
          {
            error: 'AiTEMS service unavailable',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 503 }
        );
      }
      
      // Fallback: Return user's own recipes (popular ones)
      // In production, you'd implement proper fallback logic
      const recipesRef = collection(db, 'users', userId, 'recipes');
      const snapshot = await getDocs(recipesRef);
      
      recommendations = snapshot.docs
        .slice(0, count)
        .map((doc) => ({
          itemId: doc.id,
          score: Math.random(), // Random score for fallback
        }));
    }
    
    // Get full recipe details
    const recipeIds = recommendations.map((r) => r.itemId);
    const recipes = await getRecipesByIds(userId, recipeIds);
    
    // Map scores to recipes
    const recipesWithScores = recipes.map((recipe) => {
      const recommendation = recommendations.find((r) => r.itemId === recipe.id);
      return {
        ...recipe,
        recommendationScore: recommendation?.score || 0,
      };
    });
    
    // Sort by score
    recipesWithScores.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    console.log(`✅ [Recommendations] Returning ${recipesWithScores.length} recipes`);
    
    return NextResponse.json({
      success: true,
      source,
      count: recipesWithScores.length,
      recommendations: recipesWithScores,
    });
    
  } catch (error: any) {
    console.error('❌ [Recommendations] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get recommendations',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

