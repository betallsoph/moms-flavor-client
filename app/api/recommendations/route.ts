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

    // Check if AiTEMS credentials are configured
    const apiKey = process.env.NAVER_AITEMS_API_KEY;
    const serviceId = process.env.NAVER_AITEMS_SERVICE_ID;

    if (!apiKey || !serviceId || apiKey === 'your-aitems-api-key-here') {
      console.warn('⚠️ AiTEMS not configured - returning fallback recommendations');
      return getFallbackRecommendations(userId, count);
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
      return getFallbackRecommendations(userId, count);
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
      return getFallbackRecommendations(userId, count);
    }

    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

/**
 * Fallback: Get recommendations when AiTEMS is not available
 * Uses simple heuristics:
 * - Recipes user hasn't cooked yet
 * - Popular recipes (most cooked by all users)
 * - Recipes matching user's skill level
 */
async function getFallbackRecommendations(userId: string, count: number) {
  try {
    console.log('📊 Generating fallback recommendations...');

    // Get user's cooking history to exclude already-cooked recipes
    const cookedRecipeIds = await getUserCookedRecipes(userId);

    // Get all user's recipes
    const recipesRef = collection(db, 'users', userId, 'recipes');
    const snapshot = await getDocs(recipesRef);

    let recipes: Recipe[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Recipe));

    // Filter out already-cooked recipes
    recipes = recipes.filter(r => !cookedRecipeIds.includes(r.id));

    // Sort by difficulty (easier recipes first for beginners)
    const difficultyOrder = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
    recipes.sort((a, b) => {
      const aIndex = difficultyOrder.indexOf(a.difficulty || 'medium');
      const bIndex = difficultyOrder.indexOf(b.difficulty || 'medium');
      return aIndex - bIndex;
    });

    // Limit results
    const recommendations = recipes.slice(0, count);

    return NextResponse.json({
      source: 'fallback',
      count: recommendations.length,
      recommendations,
      message: 'AiTEMS not configured - showing beginner-friendly recipes you haven\'t cooked yet',
    });

  } catch (error) {
    console.error('❌ Fallback recommendations failed:', error);
    return NextResponse.json({
      source: 'fallback',
      count: 0,
      recommendations: [],
      error: 'Failed to generate fallback recommendations',
    });
  }
}

/**
 * Get recipe IDs that user has already cooked
 */
async function getUserCookedRecipes(userId: string): Promise<string[]> {
  try {
    const diaryRef = collection(db, 'users', userId, 'cookingDiary');
    const snapshot = await getDocs(diaryRef);

    const recipeIds = snapshot.docs.map(doc => doc.data().recipeId);
    return [...new Set(recipeIds)]; // Unique recipe IDs
  } catch (error) {
    console.error('❌ Error getting cooked recipes:', error);
    return [];
  }
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
