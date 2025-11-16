# 🔧 Naver Object Storage Setup Guide

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Firestore migration complete
- ✅ Naver Cloud account
- ✅ Object Storage service enabled

---

## 🎯 What We Need to Store

| Image Type | Usage | Collection |
|-----------|-------|-----------|
| **Recipe Cover** | Main recipe image | `recipes.coverImage` |
| **Recipe Gallery** | Step-by-step photos | `recipes.galleryImages[]` |
| **Diary Photos** | Cooking result photos | `cookingDiary.images[]` |

---

## 🚀 Implementation Steps

### 1. Install Naver Cloud SDK

```bash
npm install @aws-sdk/client-s3
# Naver Object Storage is S3-compatible
```

### 2. Setup Environment Variables

Add to `.env.local`:
```env
# Naver Object Storage
NEXT_PUBLIC_NAVER_ENDPOINT=https://kr.object.ncloudstorage.com
NEXT_PUBLIC_NAVER_REGION=kr-standard
NEXT_PUBLIC_NAVER_BUCKET=moms-flavor-images
NAVER_ACCESS_KEY=your_access_key
NAVER_SECRET_KEY=your_secret_key
```

### 3. Create Upload Service

**File**: `/libs/naverStorage.ts`

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_NAVER_REGION!,
  endpoint: process.env.NEXT_PUBLIC_NAVER_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.NAVER_ACCESS_KEY!,
    secretAccessKey: process.env.NAVER_SECRET_KEY!,
  },
});

export async function uploadImage(
  file: File,
  folder: 'recipes' | 'diary',
  userId: string
): Promise<string> {
  const timestamp = Date.now();
  const filename = `${folder}/${userId}/${timestamp}-${file.name}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_NAVER_BUCKET!,
    Key: filename,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
    ACL: 'public-read',
  });
  
  await s3Client.send(command);
  
  return `${process.env.NEXT_PUBLIC_NAVER_ENDPOINT}/${process.env.NEXT_PUBLIC_NAVER_BUCKET}/${filename}`;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const key = imageUrl.split(`${process.env.NEXT_PUBLIC_NAVER_BUCKET}/`)[1];
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_NAVER_BUCKET!,
    Key: key,
  });
  
  await s3Client.send(command);
}
```

### 4. Create API Routes

**File**: `/app/api/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/libs/naverStorage';
import { auth } from '@/libs/firebase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as 'recipes' | 'diary';
    const userId = formData.get('userId') as string;
    
    if (!file || !folder || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const imageUrl = await uploadImage(file, folder, userId);
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### 5. Update Firestore Types

**File**: `/types/recipe.ts`

Add image fields:
```typescript
export interface Recipe {
  // ... existing fields
  coverImage?: string; // Naver Object Storage URL
  galleryImages?: string[]; // Array of image URLs
}

export interface CookingDiaryEntry {
  // ... existing fields
  images?: string[]; // Array of image URLs
}
```

### 6. Create Image Upload Component

**File**: `/components/ImageUpload.tsx`

```typescript
'use client';

import { useState } from 'react';
import { auth } from '@/libs/firebase';

interface ImageUploadProps {
  folder: 'recipes' | 'diary';
  onUploadComplete: (imageUrl: string) => void;
  maxSizeMB?: number;
}

export default function ImageUpload({
  folder,
  onUploadComplete,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Not authenticated');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('userId', userId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { imageUrl } = await response.json();
      onUploadComplete(imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-orange-50 file:text-orange-700
          hover:file:bg-orange-100
          disabled:opacity-50"
      />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg"
        />
      )}
      {uploading && (
        <p className="text-sm text-gray-500">Uploading...</p>
      )}
    </div>
  );
}
```

---

## 🔧 Integration Points

### 1. Recipe Gallery Page

**File**: `/app/recipes/[id]/gallery/page.tsx`

```typescript
import ImageUpload from '@/components/ImageUpload';

// Add to component:
const [galleryImages, setGalleryImages] = useState<string[]>([]);

const handleImageUpload = (imageUrl: string) => {
  setGalleryImages([...galleryImages, imageUrl]);
};

// In JSX:
<ImageUpload
  folder="recipes"
  onUploadComplete={handleImageUpload}
/>

// Save to Firestore:
await RecipeService.update(recipeId, {
  galleryImages: galleryImages,
});
```

### 2. Cooking Diary

**File**: `/app/cook/[id]/reflection/page.tsx`

Similar to recipe gallery, but use `folder="diary"`.

---

## 🛡️ Security Considerations

1. **Server-side validation**
   - Validate file type (images only)
   - Validate file size (< 5MB)
   - Validate user authentication

2. **Naver Object Storage ACL**
   - Set to `public-read` for images
   - Keep access keys server-side only

3. **Firestore rules**
   - Already in place for recipes/diary
   - Image URLs stored as strings

---

## 📊 Cost Estimation

Naver Object Storage pricing (as of 2025):
- Storage: ~₩100/GB/month
- Transfer: ~₩100/GB
- Requests: ~₩0.5/1000 requests

**Estimated for 100 users:**
- 100 recipes × 5 images × 500KB = 250MB
- 100 diary entries × 3 images × 500KB = 150MB
- **Total**: ~400MB ≈ ₩40/month + transfer

---

## ✅ Testing Checklist

- [ ] Upload recipe cover image
- [ ] Upload recipe gallery images
- [ ] Upload cooking diary images
- [ ] Delete images when recipe/diary deleted
- [ ] Images display correctly
- [ ] Images accessible via URL
- [ ] File size validation works
- [ ] File type validation works
- [ ] Authentication required

---

## 🚀 Next Steps

1. **Setup Naver Cloud Account**
   - Create Object Storage bucket
   - Get access keys
   - Set CORS policy

2. **Install Dependencies**
   ```bash
   npm install @aws-sdk/client-s3
   ```

3. **Create Files**
   - `/libs/naverStorage.ts`
   - `/app/api/upload/route.ts`
   - `/components/ImageUpload.tsx`

4. **Update Pages**
   - Gallery page
   - Diary reflection page
   - Recipe detail page (display)

5. **Test & Deploy**

---

**Ready to implement? Let me know and we'll start!** 🚀
