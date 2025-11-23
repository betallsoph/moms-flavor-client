/**
 * API Route: Get Recipe Recommendations from NAVER AiTEMS
 *
 * GET /api/recommendations?userId={userId}&count={count}
 *
 * Fetches personalized recipe recommendations based on:
 * - User's cooking history
 * - Ratings and preferences
 * - Skill level and cooking patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/libs/firebase';
import { Recipe } from '@/types/recipe';

interface AiTemsRecommendation {
  itemId: string;
  score: number;
}

interface AiTemsResponse {
  recommendations: AiTemsRecommendation[];
}

/**
 * GET recommendations for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const count = parseInt(searchParams.get('count') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const aitemsEnabled =
      (process.env.NAVER_AITEMS_ENABLED || '').toLowerCase() === 'true';

    if (!aitemsEnabled) {
      console.info('ℹ️ AiTEMS disabled via env - returning fallback recommendations');
      return getFallbackRecommendations(
        userId,
        count,
        'Sẽ thêm AiTEMS sau.'
      );
    }

    // Check if AiTEMS credentials are configured
    const apiKey = process.env.NAVER_AITEMS_API_KEY;
    const serviceId = process.env.NAVER_AITEMS_SERVICE_ID;

    if (!apiKey || !serviceId || apiKey === 'your-aitems-api-key-here') {
      console.warn('⚠️ AiTEMS not configured - returning fallback recommendations');
      return getFallbackRecommendations(
        userId,
        count,
        'Chưa cấu hình AiTEMS. Vui lòng kiểm tra lại.'
      );
    }

    // Call NAVER AiTEMS API
    const aitemsUrl = `https://aitems.apigw.ntruss.com/services/${serviceId}/recommend?userId=${userId}&count=${count}`;

    const response = await fetch(aitemsUrl, {
      method: 'GET',
      headers: {
        'x-ncp-apigw-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ AiTEMS API error:', response.status, await response.text());
      return getFallbackRecommendations(
        userId,
        count,
        'AiTEMS gặp lỗi. Đang trả về danh sách rỗng.'
      );
    }

    const data: AiTemsResponse = await response.json();

    // Map recipe IDs to actual recipes from Firestore
    const recipeIds = data.recommendations.map(r => r.itemId);
    const recipes = await getRecipesByIds(userId, recipeIds);

    // Preserve recommendation scores
    const recommendationsWithScores = recipes.map(recipe => {
      const recommendation = data.recommendations.find(r => r.itemId === recipe.id);
      return {
        ...recipe,
        recommendationScore: recommendation?.score || 0,
      };
    });

    return NextResponse.json({
      source: 'aitems',
      count: recommendationsWithScores.length,
      recommendations: recommendationsWithScores,
    });

  } catch (error) {
    console.error('❌ Error fetching recommendations:', error);

    // Return fallback recommendations on error
    const userId = request.nextUrl.searchParams.get('userId');
    const count = parseInt(request.nextUrl.searchParams.get('count') || '10');

    if (userId) {
      return getFallbackRecommendations(
        userId,
        count,
        'Không lấy được gợi ý AI. Vui lòng thử lại sau.'
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

/**
 * Fallback: Return message when AiTEMS is not configured
 */
async function getFallbackRecommendations(userId: string, count: number, message?: string) {
  console.log('⚠️ Using fallback recommendations (AiTEMS unavailable)');

  return NextResponse.json({
    source: 'fallback',
    count: 0,
    recommendations: [],
    message: message || 'Tính năng gợi ý AI tạm thời không khả dụng.',
  });
}

/**
 * Fetch recipes by their IDs from Firestore
 */
async function getRecipesByIds(userId: string, recipeIds: string[]): Promise<Recipe[]> {
  try {
    if (recipeIds.length === 0) return [];

    const recipesRef = collection(db, 'users', userId, 'recipes');
    const recipes: Recipe[] = [];

    // Fetch each recipe by ID
    for (const recipeId of recipeIds) {
      const q = query(recipesRef, where('__name__', '==', recipeId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        recipes.push({
          id: doc.id,
          ...doc.data()
        } as Recipe);
      }
    }

    return recipes;
  } catch (error) {
    console.error('❌ Error fetching recipes by IDs:', error);
    return [];
  }
}
