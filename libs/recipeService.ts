import { Recipe } from '@/types/recipe';
import { mockRecipes } from '@/data/mockRecipes';

const STORAGE_KEY = 'recipes';

/**
 * Recipe Service - LocalStorage implementation
 * TODO: Replace with API calls when backend is ready
 */
export class RecipeService {
  /**
   * Initialize localStorage with mock data if empty
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;
    
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing || JSON.parse(existing).length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockRecipes));
    }
  }

  /**
   * Reset to mock data (for development)
   */
  static resetToMockData(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockRecipes));
  }

  /**
   * Get all recipes
   * TODO: Replace with GET /api/recipes
   */
  static async getAll(): Promise<Recipe[]> {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get recipe by ID
   * TODO: Replace with GET /api/recipes/:id
   */
  static async getById(id: string): Promise<Recipe | null> {
    const recipes = await this.getAll();
    return recipes.find(r => r.id === id) || null;
  }

  /**
   * Create new recipe
   * TODO: Replace with POST /api/recipes
   */
  static async create(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
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
   * TODO: Replace with PUT /api/recipes/:id
   */
  static async update(id: string, updates: Partial<Recipe>): Promise<Recipe | null> {
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
   * TODO: Replace with DELETE /api/recipes/:id
   */
  static async delete(id: string): Promise<boolean> {
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

// Initialize on import
if (typeof window !== 'undefined') {
  RecipeService.initialize();
}
