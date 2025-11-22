import { NextRequest, NextResponse } from 'next/server';
import { generateNostalgiaStory } from '@/libs/naverAi';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dishName = (body?.dishName as string | undefined)?.trim();
    const ingredients = (body?.ingredients as string | undefined)?.trim();
    const mood = (body?.mood as string | undefined)?.trim();

    if (!dishName) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên món ăn' },
        { status: 400 }
      );
    }

    const { story } = await generateNostalgiaStory({
      dishName,
      ingredients,
      mood,
    });

    return NextResponse.json(
      {
        story,
        success: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Nostalgia story error:', error);
    return NextResponse.json(
      { error: error.message || 'Không tạo được lời dẫn' },
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
