/**
 * Naver Object Storage Service
 * 
 * Service này xử lý upload và delete ảnh lên Naver Cloud Object Storage.
 * Naver Object Storage tương thích với AWS S3 API.
 * 
 * Cách hoạt động:
 * 1. Client chọn file → gửi lên API route
 * 2. API route nhận file → gọi service này
 * 3. Service upload lên Naver → trả về URL công khai
 * 4. URL được lưu vào Firestore
 */

import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';

/**
 * Khởi tạo S3 Client
 * 
 * S3Client là đối tượng kết nối đến Naver Object Storage.
 * Nó cần:
 * - endpoint: URL của Naver server
 * - region: Data center location
 * - credentials: Access key & Secret key
 */
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_NAVER_REGION || 'kr-standard',
  endpoint: process.env.NEXT_PUBLIC_NAVER_ENDPOINT || 'https://kr.object.ncloudstorage.com',
  credentials: {
    accessKeyId: process.env.NAVER_ACCESS_KEY || '',
    secretAccessKey: process.env.NAVER_SECRET_KEY || '',
  },
  // Force path style để tương thích với Naver
  forcePathStyle: false,
});

/**
 * Upload ảnh lên Naver Object Storage
 * 
 * @param file - File object từ browser
 * @param folder - Folder để organize files ('recipes' hoặc 'diary')
 * @param userId - User ID để tạo folder riêng cho mỗi user
 * @returns URL công khai của ảnh đã upload
 * 
 * File structure trong bucket:
 * image/
 *   ├── recipes/
 *   │   ├── userId1/
 *   │   │   ├── 1234567890-image1.jpg
 *   │   │   └── 1234567891-image2.jpg
 *   │   └── userId2/
 *   │       └── 1234567892-image3.jpg
 *   └── diary/
 *       └── userId1/
 *           └── 1234567893-cooking.jpg
 */
export async function uploadImage(
  file: File,
  folder: 'recipes' | 'diary',
  userId: string
): Promise<string> {
  try {
    // 1. Tạo tên file unique bằng timestamp
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Remove special chars
    // Upload vào image/ folder mà bạn đã tạo trên Naver
    const filename = `image/${folder}/${userId}/${timestamp}-${sanitizedFilename}`;
    
    console.log('🔄 Uploading to Naver:', filename);
    
    // 2. Convert File thành Buffer (format mà S3 SDK cần)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 3. Chuẩn bị command để upload
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.NEXT_PUBLIC_NAVER_BUCKET || 'moms-flavor-images',
      Key: filename, // Path + filename trong bucket
      Body: buffer, // Nội dung file
      ContentType: file.type, // MIME type (image/jpeg, image/png, etc.)
      ACL: 'public-read', // Cho phép public đọc (để hiển thị ảnh)
    };
    
    const command = new PutObjectCommand(uploadParams);
    
    // 4. Thực hiện upload
    await s3Client.send(command);
    
    // 5. Tạo URL công khai
    const bucketUrl = `${process.env.NEXT_PUBLIC_NAVER_ENDPOINT}/${process.env.NEXT_PUBLIC_NAVER_BUCKET}`;
    const imageUrl = `${bucketUrl}/${filename}`;
    
    console.log('✅ Upload success:', imageUrl);
    
    return imageUrl;
  } catch (error: any) {
    console.error('❌ Upload error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      error: error,
    });
    throw new Error(`Failed to upload image to Naver Object Storage: ${error.message || error}`);
  }
}

/**
 * Xóa ảnh từ Naver Object Storage
 * 
 * @param imageUrl - URL đầy đủ của ảnh cần xóa
 * 
 * Ví dụ URL:
 * https://kr.object.ncloudstorage.com/moms-flavor-images/recipes/user123/1234567890-image.jpg
 * 
 * Từ URL này, chúng ta extract ra Key:
 * recipes/user123/1234567890-image.jpg
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // 1. Extract key từ URL
    // Split URL và lấy phần sau bucket name
    const bucketName = process.env.NEXT_PUBLIC_NAVER_BUCKET || 'moms-flavor-images';
    const urlParts = imageUrl.split(`${bucketName}/`);
    
    if (urlParts.length < 2) {
      console.warn('⚠️ Invalid image URL format:', imageUrl);
      return;
    }
    
    const key = urlParts[1]; // recipes/user123/1234567890-image.jpg
    
    console.log('🗑️ Deleting from Naver:', key);
    
    // 2. Chuẩn bị command để xóa
    const deleteParams: DeleteObjectCommandInput = {
      Bucket: bucketName,
      Key: key,
    };
    
    const command = new DeleteObjectCommand(deleteParams);
    
    // 3. Thực hiện xóa
    await s3Client.send(command);
    
    console.log('✅ Delete success');
  } catch (error) {
    console.error('❌ Delete error:', error);
    // Không throw error để không block việc xóa recipe/diary
    // Worst case: file orphan trong storage (có thể cleanup sau)
  }
}

/**
 * Validate file trước khi upload
 * 
 * @param file - File cần validate
 * @param maxSizeMB - Kích thước tối đa (MB)
 * @returns true nếu valid, throw error nếu không
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): boolean {
  // 1. Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  // 2. Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File too large. Max size: ${maxSizeMB}MB`);
  }
  
  // 3. Check filename
  if (file.name.length > 255) {
    throw new Error('Filename too long');
  }
  
  return true;
}

/**
 * Helper: Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Helper: Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Upload JSON data to Naver Object Storage
 * 
 * Được dùng để sync data cho AiTEMS recommendation system
 * 
 * @param data - JSON data object
 * @param folder - Folder path (e.g., 'cook-history/items')
 * @param filename - Filename (e.g., 'items-2024-11-10.json')
 * @returns URL of uploaded JSON file
 * 
 * File structure for AiTEMS:
 * cook-history/
 *   ├── items/          # Recipe data
 *   │   └── items-YYYY-MM-DD.json
 *   ├── users/          # User preferences
 *   │   └── users-YYYY-MM-DD.json
 *   └── interactions/   # Cooking events
 *       └── interactions-YYYY-MM-DD.json
 */
export async function uploadJSON(
  data: any,
  folder: string,
  filename: string
): Promise<string> {
  try {
    const filepath = `cook-history/${folder}/${filename}`;
    
    console.log('🔄 Uploading JSON to Naver:', filepath);
    
    // Convert JSON object to string buffer
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    
    // Prepare upload command
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.NEXT_PUBLIC_NAVER_BUCKET || 'moms-flavor-images',
      Key: filepath,
      Body: buffer,
      ContentType: 'application/json',
      ACL: 'public-read', // AiTEMS cần đọc được
    };
    
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    // Generate public URL
    const bucketUrl = `${process.env.NEXT_PUBLIC_NAVER_ENDPOINT}/${process.env.NEXT_PUBLIC_NAVER_BUCKET}`;
    const jsonUrl = `${bucketUrl}/${filepath}`;
    
    console.log('✅ JSON upload success:', jsonUrl);
    
    return jsonUrl;
  } catch (error: any) {
    console.error('❌ JSON upload error:', error);
    throw new Error(`Failed to upload JSON to Naver Object Storage: ${error.message || error}`);
  }
}

/**
 * Upload audio (voice) to Naver Object Storage
 * Folder mặc định: audio/speech/{userId}/timestamp-filename
 */
export async function uploadAudio(
  file: File,
  userId: string,
  folder: string = 'audio/speech'
): Promise<string> {
  try {
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${userId}/${timestamp}-${sanitizedFilename}`;

    console.log('🎙️ Uploading audio to Naver:', key);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.NEXT_PUBLIC_NAVER_BUCKET || 'moms-flavor-images',
      Key: key,
      Body: buffer,
      ContentType: file.type || 'audio/webm',
      ACL: 'public-read',
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const bucketUrl = `${process.env.NEXT_PUBLIC_NAVER_ENDPOINT}/${process.env.NEXT_PUBLIC_NAVER_BUCKET}`;
    const audioUrl = `${bucketUrl}/${key}`;

    console.log('✅ Audio upload success:', audioUrl);
    return audioUrl;
  } catch (error: any) {
    console.error('❌ Audio upload error:', error);
    throw new Error(`Failed to upload audio to Naver Object Storage: ${error.message || error}`);
  }
}

/**
 * Validate audio file before upload
 */
export function validateAudioFile(file: File, maxSizeMB: number = 20): boolean {
  const allowedTypes = [
    'audio/webm',
    'audio/wav',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/mp4',
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid audio type. Allowed: webm, wav, mp3, ogg, mp4`);
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`Audio too large. Max size: ${maxSizeMB}MB`);
  }

  if (file.name.length > 255) {
    throw new Error('Filename too long');
  }

  return true;
}
