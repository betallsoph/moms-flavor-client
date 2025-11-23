export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface Instruction {
  id: string;
  step: number;
  title: string;
  description: string;
}

export interface Recipe {
  id: string;
  dishName?: string;
  recipeName?: string;
  sameAsDish?: boolean;
  difficulty?: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';
  cookingTime?: 'very_fast' | 'fast' | 'medium' | 'slow' | 'very_slow';
  estimateTime?: boolean;
  estimatedTime?: string;
  instructor?: string;
  description?: string;
  ingredientsList?: Ingredient[];
  favoriteBrands?: string[];
  specialNotes?: string;
  instructions?: string; // JSON string of Instruction[]
  tips?: string;
  coverImage?: string;
  galleryImages?: string[];
  emotionTags?: string[]; // Emotional tags for mood-based search
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
