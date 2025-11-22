import { NextRequest, NextResponse } from 'next/server';
import { extractFullRecipeFromSpeech, transcribeLongSpeechFromUrl } from '@/libs/naverAi';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const audioUrl = body?.audioUrl as string | undefined;
    const lang = (body?.lang as string | undefined) || 'Eng';

    if (!audioUrl) {
      return NextResponse.json(
        { error: 'audioUrl is required' },
        { status: 400 }
      );
    }

    const transcription = await transcribeLongSpeechFromUrl(audioUrl, {
      lang,
      completion: 'sync',
    });

    if (!transcription.text) {
      throw new Error('Empty transcription result');
    }

    const summary = await extractFullRecipeFromSpeech(transcription.text);

    return NextResponse.json(
      {
        success: true,
        text: transcription.text,
        tenMon: summary.ten_mon || '',
        ingredients: summary.nguyen_lieu || [],
        steps: summary.cach_lam || [],
        overallNote: summary.bi_kip || '',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Long STT API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process long speech' },
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
