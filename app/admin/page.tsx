'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeService } from '@/libs/recipeService';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Reset to mock data
    RecipeService.resetToMockData();
    
    // Redirect to recipes page
    setTimeout(() => {
      router.push('/recipes');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">✅ Dữ liệu đã được khôi phục</h1>
        <p className="text-gray-600 mb-4">Đang chuyển hướng đến trang công thức...</p>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
      </div>
    </div>
  );
}
