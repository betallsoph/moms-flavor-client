import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Recipe as RecipeType, Ingredient } from '@/types/recipe';

// Re-export Recipe type
export type Recipe = RecipeType;

export interface CookingSession {
  id: string; // recipeId
  userId: string;
  recipeId: string;
  completedSteps: number[];
  activeTimers: Record<number, { endTime: number; duration: string }>;
  lastUpdated: string;
}

export interface CookingDiaryEntry {
  id: string;
  userId: string;
  recipeId: string;
  dishName: string;
  cookDate: string;
  mistakes: string;
  improvements: string;
  imageCount: number;
  timestamp: string;
}

// ============ RECIPES ============

/**
 * Create a new recipe for a user
 */
export async function createRecipe(userId: string, recipeData: Omit<Recipe, 'id' | 'createdAt'>): Promise<string> {
  const recipeId = doc(collection(db, 'users', userId, 'recipes')).id;
  const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
  
  const recipe: Recipe = {
    ...recipeData,
    id: recipeId,
    createdAt: new Date().toISOString(),
  };
  
  await setDoc(recipeRef, recipe);
  return recipeId;
}

/**
 * Get all recipes for a user
 */
export async function getUserRecipes(userId: string): Promise<Recipe[]> {
  const recipesRef = collection(db, 'users', userId, 'recipes');
  const q = query(recipesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as Recipe);
}

/**
 * Get a single recipe by ID
 */
export async function getRecipe(userId: string, recipeId: string): Promise<Recipe | null> {
  const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
  const snapshot = await getDoc(recipeRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data() as Recipe;
}

/**
 * Update a recipe
 */
export async function updateRecipe(userId: string, recipeId: string, updates: Partial<Recipe>): Promise<void> {
  const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
  await updateDoc(recipeRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a recipe
 */
export async function deleteRecipe(userId: string, recipeId: string): Promise<void> {
  const recipeRef = doc(db, 'users', userId, 'recipes', recipeId);
  await deleteDoc(recipeRef);
  
  // Also delete associated cooking session if exists
  const sessionRef = doc(db, 'users', userId, 'cookingSessions', recipeId);
  try {
    await deleteDoc(sessionRef);
  } catch (error) {
    // Session might not exist, that's okay
  }
}

/**
 * Subscribe to user recipes (real-time)
 */
export function subscribeToUserRecipes(
  userId: string,
  callback: (recipes: Recipe[]) => void
): () => void {
  const recipesRef = collection(db, 'users', userId, 'recipes');
  const q = query(recipesRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const recipes = snapshot.docs.map(doc => doc.data() as Recipe);
    callback(recipes);
  });
}

// ============ COOKING SESSIONS ============

/**
 * Get cooking session for a recipe
 */
export async function getCookingSession(userId: string, recipeId: string): Promise<CookingSession | null> {
  const sessionRef = doc(db, 'users', userId, 'cookingSessions', recipeId);
  const snapshot = await getDoc(sessionRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data() as CookingSession;
}

/**
 * Update cooking session (completed steps and timers)
 */
export async function updateCookingSession(
  userId: string,
  recipeId: string,
  data: { completedSteps?: number[]; activeTimers?: Record<number, { endTime: number; duration: string }> }
): Promise<void> {
  const sessionRef = doc(db, 'users', userId, 'cookingSessions', recipeId);
  
  const session: CookingSession = {
    id: recipeId,
    userId,
    recipeId,
    completedSteps: data.completedSteps || [],
    activeTimers: data.activeTimers || {},
    lastUpdated: new Date().toISOString(),
  };
  
  await setDoc(sessionRef, session, { merge: true });
}

/**
 * Clear cooking session (when starting fresh)
 */
export async function clearCookingSession(userId: string, recipeId: string): Promise<void> {
  const sessionRef = doc(db, 'users', userId, 'cookingSessions', recipeId);
  await deleteDoc(sessionRef);
}

/**
 * Subscribe to cooking session (real-time updates)
 */
export function subscribeToCookingSession(
  userId: string,
  recipeId: string,
  callback: (session: CookingSession | null) => void
): () => void {
  const sessionRef = doc(db, 'users', userId, 'cookingSessions', recipeId);
  
  return onSnapshot(sessionRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback(snapshot.data() as CookingSession);
  });
}

// ============ COOKING DIARY ============

/**
 * Create a cooking diary entry
 */
export async function createDiaryEntry(
  userId: string,
  entryData: Omit<CookingDiaryEntry, 'id' | 'userId' | 'timestamp'>
): Promise<string> {
  const entryId = doc(collection(db, 'users', userId, 'cookingDiary')).id;
  const entryRef = doc(db, 'users', userId, 'cookingDiary', entryId);
  
  const entry: CookingDiaryEntry = {
    ...entryData,
    id: entryId,
    userId,
    timestamp: new Date().toISOString(),
  };
  
  await setDoc(entryRef, entry);
  return entryId;
}

/**
 * Get all cooking diary entries for a user
 */
export async function getUserDiaryEntries(userId: string): Promise<CookingDiaryEntry[]> {
  const entriesRef = collection(db, 'users', userId, 'cookingDiary');
  const q = query(entriesRef, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => doc.data() as CookingDiaryEntry);
}

/**
 * Get a single diary entry
 */
export async function getDiaryEntry(userId: string, entryId: string): Promise<CookingDiaryEntry | null> {
  const entryRef = doc(db, 'users', userId, 'cookingDiary', entryId);
  const snapshot = await getDoc(entryRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return snapshot.data() as CookingDiaryEntry;
}

/**
 * Update a diary entry
 */
export async function updateDiaryEntry(
  userId: string,
  entryId: string,
  updates: Partial<Omit<CookingDiaryEntry, 'id' | 'userId' | 'timestamp'>>
): Promise<void> {
  const entryRef = doc(db, 'users', userId, 'cookingDiary', entryId);
  await updateDoc(entryRef, updates);
}

/**
 * Delete a diary entry
 */
export async function deleteDiaryEntry(userId: string, entryId: string): Promise<void> {
  const entryRef = doc(db, 'users', userId, 'cookingDiary', entryId);
  await deleteDoc(entryRef);
}

/**
 * Subscribe to diary entries (real-time updates)
 */
export function subscribeToDiaryEntries(
  userId: string,
  callback: (entries: CookingDiaryEntry[]) => void
): () => void {
  const entriesRef = collection(db, 'users', userId, 'cookingDiary');
  const q = query(entriesRef, orderBy('timestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => doc.data() as CookingDiaryEntry);
    callback(entries);
  });
}

