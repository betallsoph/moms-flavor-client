import { NextRequest, NextResponse } from 'next/server';
import { transcribeSpeechWithClova } from '@/libs/naverAi';

export async function POST(req: NextRequest) {
  try {
    const audioBlob = await req.blob();
    if (audioBlob.size === 0) {
      return NextResponse.json(
        { error: 'No audio file was provided in the request.' },
        { status: 400 }
      );
    }

    // Convert Blob to Buffer
    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());

    const lang = req.nextUrl.searchParams.get('lang') || 'ko-KR';

    const result = await transcribeSpeechWithClova(audioBuffer, { lang });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Clova STT API Error]', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
