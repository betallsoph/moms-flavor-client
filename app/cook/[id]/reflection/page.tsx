'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';
import DevModeButton from '@/components/DevModeButton';
import { mockFormData } from '@/data/mockFormData';
import { auth } from '@/libs/firebase';
import * as firestoreService from '@/libs/firestore';

interface CookingEntry {
  id: string;
  recipeId: string;
  dishName: string;
  cookDate: string;
  mistakes: string;
  improvements: string;
  imageCount: number;
  timestamp: string;
}

export default function ReflectionPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  
  const [mistakes, setMistakes] = useState('');
  const [improvements, setImprovements] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [recipeName, setRecipeName] = useState('');

  // Dev mode: Auto fill form
  const handleDevFillForm = () => {
    setMistakes(mockFormData.reflection.mistakes);
    setImprovements(mockFormData.reflection.improvements);
  };

  useEffect(() => {
    // Load recipe name
    const loadRecipe = async () => {
      const recipe = await RecipeService.getById(recipeId);
      if (recipe) {
        setRecipeName(recipe.dishName || 'Món ăn');
      }
    };
    
    loadRecipe();
  }, [recipeId]);

  const handleSaveAndContinue = async () => {
    const userId = auth.currentUser?.uid;
    
    if (userId) {
      // Save to Firestore
      try {
        await firestoreService.createDiaryEntry(userId, {
          recipeId,
          dishName: recipeName,
          cookDate: new Date().toLocaleDateString('vi-VN'),
          mistakes,
          improvements,
          images: [], // TODO: Will add image upload in next phase
        });
      } catch (error) {
        console.error('Error saving diary entry to Firestore:', error);
      }
    } else {
      // Fallback to localStorage for non-authenticated users
      const entry = {
        id: `diary-${Date.now()}`,
        recipeId,
        dishName: recipeName,
        cookDate: new Date().toLocaleDateString('vi-VN'),
        mistakes,
        improvements,
        images: [], // TODO: Will add image upload in next phase
        timestamp: new Date().toISOString(),
      };
      
      const diary = JSON.parse(localStorage.getItem('cooking-diary') || '[]');
      diary.push(entry);
      localStorage.setItem('cooking-diary', JSON.stringify(diary));
    }
    
    router.push(`/cook/${recipeId}/congratulations`);
  };

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
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Rút kinh nghiệm từ quá trình nấu
          </h2>
          <p className="text-gray-600 mb-8">
            Ghi lại những gì bạn đã học được để cải thiện lần sau
          </p>

          <div className="space-y-6">
            {/* Mistakes */}
            <div>
              <label htmlFor="mistakes" className="block text-sm font-semibold text-gray-900 mb-2">
                ⚠️ Sai sót
              </label>
              <textarea
                id="mistakes"
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
                placeholder="Ví dụ: Nấu quá lâu nên cơm bị cháy, quên thêm muối..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-base"
              />
            </div>

            {/* Improvements */}
            <div>
              <label htmlFor="improvements" className="block text-sm font-semibold text-gray-900 mb-2">
                💡 Rút kinh nghiệm - Cải thiện
              </label>
              <textarea
                id="improvements"
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                placeholder="Ví dụ: Lần sau nên dùng lửa nhỏ, cắt rau mỏng hơn..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-base"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="images" className="block text-sm font-semibold text-gray-900 mb-2">
                📸 Upload hình ảnh khi nấu xong
              </label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={(e) => setUploadedImages(Array.from(e.target.files || []))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
              />
              {uploadedImages.length > 0 && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    ✓ Đã chọn {uploadedImages.length} ảnh:
                  </p>
                  <div className="space-y-1">
                    {uploadedImages.map((file: File, idx: number) => (
                      <p key={idx} className="text-sm text-gray-600">
                        📷 {file.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              💭 <strong>Ghi chú:</strong> Những ghi chép này sẽ giúp bạn nấu tốt hơn lần sau. Hãy cụ thể và chi tiết!
            </p>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push(`/recipes/${recipeId}`)}
              className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Quay lại
            </button>
            <button
              onClick={handleSaveAndContinue}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow"
            >
              Tiếp tục →
            </button>
          </div>
        </div>
      </main>

      {/* Dev Mode Button */}
      <DevModeButton onFillForm={handleDevFillForm} />
    </PageContainer>
  );
}
