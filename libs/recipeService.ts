import { Recipe } from '@/types/recipe';
import { auth } from './firebase';
import * as firestoreService from './firestore';

const STORAGE_KEY = 'recipes';

/**
 * Recipe Service - Firestore implementation with localStorage fallback
 */
export class RecipeService {
  /**
   * Get current user ID
   */
  private static getUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  /**
   * Get all recipes
   */
  static async getAll(): Promise<Recipe[]> {
    const userId = this.getUserId();
    
    if (userId) {
      // Use Firestore
      try {
        return await firestoreService.getUserRecipes(userId);
      } catch (error) {
        console.error('Error fetching recipes from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // Fallback to localStorage
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get recipe by ID
   */
  static async getById(id: string): Promise<Recipe | null> {
    const userId = this.getUserId();
    
    if (userId) {
      // Use Firestore
      try {
        return await firestoreService.getRecipe(userId, id);
      } catch (error) {
        console.error('Error fetching recipe from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // Fallback to localStorage
    const recipes = await this.getAll();
    return recipes.find(r => r.id === id) || null;
  }

  /**
   * Create new recipe
   */
  static async create(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
    const userId = this.getUserId();
    
    if (userId) {
      // Use Firestore
      try {
        const recipeId = await firestoreService.createRecipe(userId, recipe);
        const createdRecipe = await firestoreService.getRecipe(userId, recipeId);
        return createdRecipe!;
      } catch (error) {
        console.error('Error creating recipe in Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // Fallback to localStorage
    const recipes = await this.getAll();
    const newRecipe: Recipe = {
      ...recipe,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    recipes.push(newRecipe);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    return newRecipe;
  }

  /**
   * Update recipe
   */
  static async update(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
    const userId = this.getUserId();
    
    if (userId) {
      // Use Firestore
      try {
        await firestoreService.updateRecipe(userId, id, updates);
        return await firestoreService.getRecipe(userId, id);
      } catch (error) {
        console.error('Error updating recipe in Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // Fallback to localStorage
    const recipes = await this.getAll();
    const index = recipes.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    recipes[index] = {
      ...recipes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    return recipes[index];
  }

  /**
   * Delete recipe
   */
  static async delete(id: string): Promise<boolean> {
    const userId = this.getUserId();
    
    if (userId) {
      // Use Firestore
      try {
        await firestoreService.deleteRecipe(userId, id);
        return true;
      } catch (error) {
        console.error('Error deleting recipe from Firestore:', error);
        // Fallback to localStorage
      }
    }
    
    // Fallback to localStorage
    const recipes = await this.getAll();
    const filtered = recipes.filter(r => r.id !== id);
    
    if (filtered.length === recipes.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  /**
   * Search recipes by name or instructor
   * TODO: Replace with GET /api/recipes?search=query
   */
  static async search(query: string): Promise<Recipe[]> {
    const recipes = await this.getAll();
    const lowercaseQuery = query.toLowerCase();
    
    return recipes.filter(r => 
      r.dishName?.toLowerCase().includes(lowercaseQuery) ||
      r.recipeName?.toLowerCase().includes(lowercaseQuery) ||
      r.instructor?.toLowerCase().includes(lowercaseQuery)
    );
  }
}
