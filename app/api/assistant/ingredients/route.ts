import { NextRequest, NextResponse } from 'next/server';
import { analyzeIngredientsForRecipes } from '@/libs/naverAi';

export const runtime = 'nodejs';

type RecipeInfo = {
  id: string;
  dishName: string;
  ingredients: string[];
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const availableIngredients = body?.ingredients as string[] | undefined;
    const savedRecipes = body?.savedRecipes as RecipeInfo[] | undefined;

    if (!availableIngredients || availableIngredients.length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng nhập ít nhất một nguyên liệu' },
        { status: 400 }
      );
    }

    const result = await analyzeIngredientsForRecipes(
      availableIngredients,
      savedRecipes || []
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Ingredient suggestion API error:', error);
    return NextResponse.json(
      { error: error.message || 'Không thể xử lý yêu cầu' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
