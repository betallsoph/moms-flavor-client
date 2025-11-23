import { NextRequest, NextResponse } from 'next/server';
import { searchRecipesByMood } from '@/libs/naverAi';

export const runtime = 'nodejs';

type RecipeInput = {
  id: string;
  dishName: string;
  emotionTags?: string[];
  description?: string;
  specialNotes?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mood = body?.mood?.trim();
    const recipes: RecipeInput[] = Array.isArray(body?.recipes) ? body.recipes : [];

    if (!mood) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tâm trạng hoặc cảm xúc của bạn' },
        { status: 400 }
      );
    }

    if (recipes.length === 0) {
      return NextResponse.json(
        { error: 'Không có công thức nào để tìm kiếm' },
        { status: 400 }
      );
    }

    const results = await searchRecipesByMood(mood, recipes);

    return NextResponse.json({
      results,
      mood,
    });
  } catch (error: any) {
    console.error('Emotion search error:', error);
    return NextResponse.json(
      { error: error.message || 'Không thể tìm kiếm theo cảm xúc' },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
