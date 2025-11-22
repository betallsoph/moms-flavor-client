import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImageWithNaver } from '@/libs/naverAi';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const lang = (formData.get('lang') as string | null) || 'ko';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'Image too large (max 10MB)' },
        { status: 400 }
      );
    }

    const result = await extractTextFromImageWithNaver(file, { lang });
    const texts =
      (result.images || [])
        .flatMap((image: any) => image?.fields || [])
        .map((field: any) => field?.inferText)
        .filter(Boolean) || [];

    return NextResponse.json(
      {
        success: true,
        texts,
        raw: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ OCR API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run Naver OCR' },
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
