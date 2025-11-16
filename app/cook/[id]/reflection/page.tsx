'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';
import { auth } from '@/libs/firebase';
import * as firestoreService from '@/libs/firestore';
import { uploadImage } from '@/libs/naverStorage';
import { syncCookingEvent } from '@/libs/aitemsSync';

export default function ReflectionPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [totalCooked, setTotalCooked] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [improvements, setImprovements] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load recipe
      const foundRecipe = await RecipeService.getById(recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      }
      
      // Get total cooking count
      const userId = auth.currentUser?.uid;
      if (userId) {
        try {
          const allEntries = await firestoreService.getUserDiaryEntries(userId);
          setTotalCooked(allEntries.length + 1); // +1 for current cooking
        } catch (error) {
          console.error('Error loading diary entries:', error);
        }
      } else {
        // Fallback to localStorage
        const diaryData = localStorage.getItem('cooking-diary') || '[]';
        const diary = JSON.parse(diaryData);
        setTotalCooked(Array.isArray(diary) ? diary.length + 1 : 1);
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
    
    // Show celebration instead of redirect
    setSaved(true);
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
        // Save to Firestore
        const entryId = await firestoreService.createDiaryEntry(userId, {
          recipeId,
          dishName: recipe?.dishName || 'Món ăn',
          cookDate: new Date().toLocaleDateString('vi-VN'),
          mistakes: notes,
          improvements: improvements,
          images: imageUrls,
        });
        
        // 🤖 Auto-sync to AiTEMS (background task)
        // Lưu data vào Object Storage để AiTEMS có thể gợi ý món ăn
        if (recipe) {
          syncCookingEvent(
            {
              id: entryId,
              userId,
              recipeId,
              dishName: recipe.dishName || 'Món ăn',
              cookDate: new Date().toLocaleDateString('vi-VN'),
              mistakes: notes,
              improvements: improvements,
              images: imageUrls,
              timestamp: new Date().toISOString(),
            },
            recipe,
            rating
          ).catch(err => {
            // Silent fail - AiTEMS sync không được thì cũng không sao
            console.warn('⚠️ AiTEMS sync failed (non-critical):', err);
          });
        }
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
    setSaved(true); // Show celebration screen
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // If saved, show celebration
  if (saved) {
    return (
      <PageContainer>
        <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
          <div className="text-center max-w-2xl">
            {/* Celebration Animation */}
            <div className="mb-8 animate-bounce">
              <div className="text-9xl inline-block">🎉</div>
            </div>

            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Tuyệt vời!
            </h1>

            <p className="text-2xl text-orange-600 font-semibold mb-12">
              Bạn đã hoàn thành nấu {recipe?.dishName || recipe?.recipeName || 'món ăn'}
            </p>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-8 mb-12">
              <p className="text-lg text-gray-900 mb-4">
                💪 <strong>Bạn vừa hoàn thành một hành trình nấu ăn tuyệt vời!</strong>
              </p>
              <p className="text-gray-700 mb-4">
                Kinh nghiệm bạn ghi lại sẽ giúp bạn nấu tốt hơn lần sau.
              </p>
              <p className="text-gray-600 text-sm">
                Chuẩn bị nấu một công thức khác? Hãy quay lại và chọn một công thức mới!
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  localStorage.removeItem('selectedRecipe');
                  router.push(`/recipes/${recipeId}`);
                }}
                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-shadow text-lg"
              >
                ← Quay lại chi tiết công thức
              </button>
              <button
                onClick={() => router.push('/recipes')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transition-shadow text-lg"
              >
                🏠 Quay lại danh sách công thức
              </button>
              <button
                onClick={() => router.push('/home')}
                className="bg-gray-200 text-gray-900 font-bold py-4 px-8 rounded-xl hover:bg-gray-300 transition-colors text-lg"
              >
                👋 Về trang chủ
              </button>
            </div>

            <p className="text-sm text-gray-600 mt-8">
              🌟 Hãy nấu thêm nữa để trở thành một đầu bếp giỏi!
            </p>
          </div>
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon="📝"
        title="Ghi lại kinh nghiệm"
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section - Celebration */}
        <div className="text-center mb-8 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-8 rounded-2xl border-2 border-green-200 shadow-lg">
          <div className="text-7xl mb-4 animate-bounce inline-block">🎉</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Tuyệt vời! Bạn đã hoàn thành món
          </h2>
          <p className="text-2xl font-bold text-orange-600 mb-4">
            {recipe?.dishName || recipe?.recipeName || 'Món ăn'}
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

          {/* Action Button */}
          <div className="mt-8">
            <button
              onClick={() => {
                // Smart button: check if user has data
                const hasData = notes.trim() || improvements.trim() || uploadedFiles.length > 0 || rating > 0;
                if (hasData) {
                  handleSave();
                } else {
                  handleSkip();
                }
              }}
              disabled={saving || uploading}
              className={`w-full font-semibold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg ${
                (() => {
                  const hasData = notes.trim() || improvements.trim() || uploadedFiles.length > 0 || rating > 0;
                  return hasData 
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-lg' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400';
                })()
              }`}
            >
              {uploading ? '📤 Đang upload ảnh...' : saving ? '💾 Đang lưu...' : (() => {
                const hasData = notes.trim() || improvements.trim() || uploadedFiles.length > 0 || rating > 0;
                return hasData ? '✓ Lưu và tiếp tục' : '⏭️ Bỏ qua';
              })()}
            </button>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
