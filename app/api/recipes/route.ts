import { NextResponse } from 'next/server';
import { RecipeService } from '@/libs/recipeService';

/**
 * GET /api/recipes
 * Get all recipes
 */
export async function GET() {
  try {
    const recipes = await RecipeService.getAll();
    return NextResponse.json({ recipes });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recipes
 * Create new recipe
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recipe = await RecipeService.create(body);
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
