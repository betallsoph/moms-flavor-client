'use client';

import { useEffect } from 'react';
import { mockRecipes } from '@/data/mockRecipes';

// Component để load mock data vào localStorage (chỉ dùng trong dev mode)
export default function LoadMockData() {
  useEffect(() => {
    // Chỉ chạy trong dev mode
    if (process.env.NODE_ENV !== 'production') {
      const existingRecipes = localStorage.getItem('recipes');
      
      // Chỉ load nếu chưa có data hoặc có ít hơn 5 recipes
      if (!existingRecipes || JSON.parse(existingRecipes).length < 5) {
        console.log('🔧 Dev Mode: Loading mock data...');
        localStorage.setItem('recipes', JSON.stringify(mockRecipes));
        console.log(`✅ Loaded ${mockRecipes.length} mock recipes`);
      }
    }
  }, []);

  return null;
}
