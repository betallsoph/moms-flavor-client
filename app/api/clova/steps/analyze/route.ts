import { NextRequest, NextResponse } from 'next/server';
import { analyzeCookingStepText } from '@/libs/naverAi';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body?.text as string | undefined;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const result = await analyzeCookingStepText(text);

    return NextResponse.json(
      {
        success: true,
        action: result.action,
        duration: result.duration,
        note: result.note,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Clova Studio analyze error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze text' },
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
