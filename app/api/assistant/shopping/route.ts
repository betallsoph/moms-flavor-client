import { NextRequest, NextResponse } from 'next/server';
import { generateSmartShoppingList } from '@/libs/naverAi';

export const runtime = 'nodejs';

type DishInput = {
  dishName: string;
  ingredients?: { name: string; quantity: string; unit: string }[];
  isFromSavedRecipe: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Dishes từ công thức đã lưu (có ingredients)
    const dishes: DishInput[] = Array.isArray(body?.dishes) ? body.dishes : [];

    // Món nhập tay (không có công thức)
    const otherDishes: string[] = Array.isArray(body?.otherDishes)
      ? body.otherDishes.filter((d: string) => typeof d === 'string' && d.trim())
      : [];

    const people = Number(body?.people) || 1;
    const meals = Number(body?.meals) || 1;

    if (dishes.length === 0 && otherDishes.length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng chọn ít nhất một món ăn' },
        { status: 400 }
      );
    }

    const result = await generateSmartShoppingList({
      dishes: dishes.map(d => ({
        dishName: d.dishName,
        ingredients: d.ingredients || [],
        isFromSavedRecipe: d.isFromSavedRecipe,
      })),
      otherDishes,
      people: Math.max(1, people),
      meals: Math.max(1, meals),
    });

    return NextResponse.json({
      fromRecipes: result.fromRecipes,
      aiSuggestions: result.aiSuggestions,
      advice: result.advice,
    });
  } catch (error: any) {
    console.error('❌ Smart shopping list error:', error);
    return NextResponse.json(
      { error: error.message || 'Không tạo được danh sách đi chợ' },
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
