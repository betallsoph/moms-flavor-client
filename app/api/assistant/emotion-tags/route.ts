import { NextRequest, NextResponse } from 'next/server';
import { generateEmotionTags } from '@/libs/naverAi';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dishName = body?.dishName?.trim();
    const storyOrNote = body?.storyOrNote?.trim();

    if (!dishName) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên món ăn' },
        { status: 400 }
      );
    }

    const tags = await generateEmotionTags(dishName, storyOrNote);

    return NextResponse.json({
      tags,
      dishName,
    });
  } catch (error: any) {
    console.error('Generate emotion tags error:', error);
    return NextResponse.json(
      { error: error.message || 'Không thể tạo emotion tags' },
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
