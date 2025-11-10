'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';
import { auth } from '@/libs/firebase';
import * as firestoreService from '@/libs/firestore';
import { uploadImage } from '@/libs/naverStorage';

interface CookingEntry {
  id: string;
  recipeId: string;
  dishName: string;
  cookDate: string;
  mistakes: string;
  improvements: string;
  images: string[];
  timestamp: string;
  rating?: number;
}

export default function ReflectionPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [previousEntries, setPreviousEntries] = useState<CookingEntry[]>([]);
  const [totalCooked, setTotalCooked] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [improvements, setImprovements] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load recipe
      const foundRecipe = await RecipeService.getById(recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      }
      
      // Load previous entries
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const entries = await firestoreService.getRecipeDiaryEntries(userId, recipeId);
          setPreviousEntries(entries);
          
          // Get total cooking count across all recipes
          const allEntries = await firestoreService.getUserDiaryEntries(userId);
          setTotalCooked(allEntries.length + 1); // +1 for current cooking
        } catch (error) {
          console.error('Error loading previous entries:', error);
        }
      } else {
        // Fallback to localStorage
        const diaryData = localStorage.getItem('cooking-diary') || '[]';
        const diary: CookingEntry[] = JSON.parse(diaryData);
        setPreviousEntries(diary.filter(e => e.recipeId === recipeId));
        setTotalCooked(diary.length + 1);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [recipeId]);

  const handleSkip = async () => {
    // Save empty entry
    const userId = auth.currentUser?.uid;
    
    if (userId) {
      try {
        await firestoreService.createDiaryEntry(userId, {
          recipeId,
          dishName: recipe?.dishName || 'Món ăn',
          cookDate: new Date().toLocaleDateString('vi-VN'),
          mistakes: '',
          improvements: '',
          images: [],
        });
      } catch (error) {
        console.error('Error saving diary entry:', error);
      }
    } else {
      // Fallback to localStorage
      const entry = {
        id: `diary-${Date.now()}`,
        recipeId,
        dishName: recipe?.dishName || 'Món ăn',
        cookDate: new Date().toLocaleDateString('vi-VN'),
        mistakes: '',
        improvements: '',
        images: [],
        timestamp: new Date().toISOString(),
      };
      
      const diary = JSON.parse(localStorage.getItem('cooking-diary') || '[]');
      diary.push(entry);
      localStorage.setItem('cooking-diary', JSON.stringify(diary));
    }
    
    router.push(`/cook/${recipeId}/congratulations`);
  };

  const handleSave = async () => {
    setSaving(true);
    const userId = auth.currentUser?.uid;
    let imageUrls: string[] = [];
    
    // Upload images if any
    if (uploadedFiles.length > 0 && userId) {
      setUploading(true);
      try {
        const uploadPromises = uploadedFiles.map(file => 
          uploadImage(file, 'diary', userId)
        );
        imageUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error uploading images:', error);
        alert('Có lỗi khi upload ảnh. Vui lòng thử lại.');
        setSaving(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    
    // Save entry
    if (userId) {
      try {
        await firestoreService.createDiaryEntry(userId, {
          recipeId,
          dishName: recipe?.dishName || 'Món ăn',
          cookDate: new Date().toLocaleDateString('vi-VN'),
          mistakes: notes,
          improvements: improvements,
          images: imageUrls,
        });
      } catch (error) {
        console.error('Error saving diary entry:', error);
        alert('Có lỗi khi lưu nhật ký. Vui lòng thử lại.');
        setSaving(false);
        return;
      }
    } else {
      // Fallback to localStorage
      const entry = {
        id: `diary-${Date.now()}`,
        recipeId,
        dishName: recipe?.dishName || 'Món ăn',
        cookDate: new Date().toLocaleDateString('vi-VN'),
        mistakes: notes,
        improvements: improvements,
        images: imageUrls,
        timestamp: new Date().toISOString(),
        rating,
      };
      
      const diary = JSON.parse(localStorage.getItem('cooking-diary') || '[]');
      diary.push(entry);
      localStorage.setItem('cooking-diary', JSON.stringify(diary));
    }
    
    setSaving(false);
    router.push(`/cook/${recipeId}/congratulations`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <PageHeader
        icon="📝"
        title="Ghi lại kinh nghiệm"
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push(`/recipes/${recipeId}`),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section - Celebration */}
        <div className="text-center mb-8 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-8 rounded-2xl border-2 border-green-200 shadow-lg">
          <div className="text-7xl mb-4 animate-bounce inline-block">🎉</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Tuyệt vời! Bạn đã hoàn thành món
          </h2>
          <p className="text-2xl font-bold text-orange-600 mb-4">
            {recipe?.dishName || recipe?.recipeName}
          </p>
          <p className="text-gray-600 text-lg">
            Đây là món ăn thứ{' '}
            <span className="font-bold text-green-600 text-2xl">#{totalCooked}</span>{' '}
            của bạn! 🌟
          </p>
          
          {/* Quick Rating */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">Đánh giá lần nấu này:</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Previous Entries Context */}
        {previousEntries.length > 0 && (
          <div className="mb-8 bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
            <p className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>📚</span>
              <span>Bạn đã nấu món này {previousEntries.length} lần trước</span>
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-blue-700 hover:text-blue-900 font-medium">
                💡 Xem ghi chú lần gần nhất
              </summary>
              <div className="mt-3 p-4 bg-white rounded-lg border border-blue-200">
                <p className="text-gray-600 text-xs mb-1">
                  {previousEntries[0].cookDate}
                </p>
                {previousEntries[0].improvements && (
                  <div className="mb-2">
                    <p className="font-semibold text-gray-700 text-sm">Cải thiện:</p>
                    <p className="text-gray-700">{previousEntries[0].improvements}</p>
                  </div>
                )}
                {previousEntries[0].mistakes && (
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">Ghi chú:</p>
                    <p className="text-gray-700">{previousEntries[0].mistakes}</p>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Ghi lại trải nghiệm của bạn
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            Những ghi chép này sẽ giúp bạn nấu ngon hơn lần sau
          </p>

          <div className="space-y-6">
            {/* Notes - Reworded */}
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
                🤔 Điều gì đặc biệt trong lần nấu này?
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Hôm nay món ăn hơi mặn, có thể do thêm nước mắm quá nhiều..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-base"
              />
            </div>

            {/* Improvements - Reworded */}
            <div>
              <label htmlFor="improvements" className="block text-sm font-semibold text-gray-900 mb-2">
                💪 Mẹo để món ngon hơn lần sau
              </label>
              <textarea
                id="improvements"
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="Ví dụ: Lần sau nên dùng lửa nhỏ hơn, cắt rau nhỏ và đều hơn, thêm ít đường để cân bằng..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-base"
              />
            </div>

            {/* Image Upload with Preview */}
            <div>
              <label htmlFor="images" className="block text-sm font-semibold text-gray-900 mb-2">
                📸 Chụp ảnh món ăn của bạn
              </label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={(e) => setUploadedFiles(Array.from(e.target.files || []))}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 focus:outline-none focus:border-orange-500 cursor-pointer transition-colors"
              />
              
              {/* Preview Thumbnails */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-green-900 mb-3">
                    ✓ Đã chọn {uploadedFiles.length} ảnh
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {uploadedFiles.map((file: File, idx: number) => (
                      <div key={idx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => {
                              setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx));
                            }}
                            className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold"
                          >
                            Xóa
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-900">
              💭 <strong>Tip:</strong> Ghi chép chi tiết sẽ giúp bạn cải thiện kỹ năng nấu ăn nhanh hơn!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSkip}
              disabled={saving || uploading}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⏭️ Bỏ qua, ghi sau
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '📤 Đang upload ảnh...' : saving ? '💾 Đang lưu...' : '✓ Lưu và tiếp tục'}
            </button>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
