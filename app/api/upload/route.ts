/**
 * API Route: Upload ảnh lên Naver Object Storage
 * 
 * Endpoint: POST /api/upload
 * 
 * Flow:
 * 1. Client gửi FormData với file + metadata
 * 2. Server validate request
 * 3. Server upload lên Naver
 * 4. Server trả về URL
 * 5. Client lưu URL vào Firestore
 * 
 * Security:
 * - Server-side only (access keys không expose ra client)
 * - Validate file type & size
 * - TODO: Add authentication check
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, validateImageFile } from '@/libs/naverStorage';

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Received upload request');
    
    // 1. Parse FormData từ request
    const formData = await request.formData();
    
    // 2. Extract các fields
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as 'recipes' | 'diary' | null;
    const userId = formData.get('userId') as string | null;
    
    // 3. Validate required fields
    if (!file) {
      console.error('❌ Missing file');
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }
    
    if (!folder || !['recipes', 'diary'].includes(folder)) {
      console.error('❌ Invalid folder:', folder);
      return NextResponse.json(
        { error: 'Invalid folder. Must be "recipes" or "diary"' },
        { status: 400 }
      );
    }
    
    if (!userId) {
      console.error('❌ Missing userId');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log('📝 Upload request details:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      folder,
      userId,
    });
    
    // 4. Validate file
    try {
      validateImageFile(file, 5); // Max 5MB
    } catch (validationError: any) {
      console.error('❌ Validation error:', validationError.message);
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      );
    }
    
    // 5. Upload lên Naver
    const imageUrl = await uploadImage(file, folder, userId);
    
    // 6. Trả về URL
    console.log('✅ Upload complete:', imageUrl);
    return NextResponse.json(
      { 
        success: true,
        imageUrl,
        filename: file.name,
        size: file.size,
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('❌ Upload API error:', error);
    
    // Trả về error message
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload image',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET method - Không support
 * API này chỉ accept POST requests
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to upload images.' },
    { status: 405 }
  );
}
