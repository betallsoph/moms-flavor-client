import { NextRequest, NextResponse } from 'next/server';
import { uploadAudio, validateAudioFile } from '@/libs/naverStorage';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string | null) || 'anonymous';
    const folder = (formData.get('folder') as string | null) || 'audio/speech';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    try {
      validateAudioFile(file, 20); // up to 20MB
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const audioUrl = await uploadAudio(file, userId, folder);

    return NextResponse.json(
      {
        success: true,
        audioUrl,
        filename: file.name,
        size: file.size,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Audio upload API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload audio' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload audio.' },
    { status: 405 }
  );
}
