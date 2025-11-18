import { NextRequest, NextResponse } from 'next/server';
import { transcribeSpeechWithNaver } from '@/libs/naverAi';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const lang = (formData.get('lang') as string | null) || 'Kor';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Giới hạn size 15MB để tránh file quá lớn đẩy lên lambda
    const maxSizeBytes = 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'Audio file too large (max 15MB)' },
        { status: 400 }
      );
    }

    const result = await transcribeSpeechWithNaver(file, { lang });

    return NextResponse.json(
      {
        success: true,
        text: result.text ?? '',
        raw: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ STT API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to transcribe audio with Naver STT',
      },
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
