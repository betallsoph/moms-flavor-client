import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/libs/firebase';
import * as firestoreService from '@/libs/firestore';

interface UseCookingSessionProps {
  recipeId: string;
}

interface CookingSessionState {
  completedSteps: Set<number>;
  activeTimers: Record<number, { endTime: number; duration: string }>;
  loading: boolean;
}

export function useCookingSession({ recipeId }: UseCookingSessionProps) {
  const [state, setState] = useState<CookingSessionState>({
    completedSteps: new Set(),
    activeTimers: {},
    loading: true,
  });

  const userId = auth.currentUser?.uid;

  // Load initial state
  useEffect(() => {
    const loadSession = async () => {
      if (userId) {
        // Load from Firestore
        try {
          const session = await firestoreService.getCookingSession(userId, recipeId);
          if (session) {
            setState({
              completedSteps: new Set(session.completedSteps),
              activeTimers: session.activeTimers,
              loading: false,
            });
          } else {
            setState(prev => ({ ...prev, loading: false }));
          }
        } catch (error) {
          console.error('Error loading cooking session:', error);
          // Fallback to localStorage
          loadFromLocalStorage();
        }
      } else {
        // Not authenticated, use localStorage
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const savedTimers = localStorage.getItem(`cook-timers-${recipeId}`);
      const savedCompleted = localStorage.getItem(`cook-completed-${recipeId}`);

      setState({
        completedSteps: savedCompleted ? new Set(JSON.parse(savedCompleted)) : new Set(),
        activeTimers: savedTimers ? JSON.parse(savedTimers) : {},
        loading: false,
      });
    };

    loadSession();
  }, [recipeId, userId]);

  // Subscribe to real-time updates if authenticated
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestoreService.subscribeToCookingSession(
      userId,
      recipeId,
      (session) => {
        if (session) {
          setState({
            completedSteps: new Set(session.completedSteps),
            activeTimers: session.activeTimers,
            loading: false,
          });
        }
      }
    );

    return unsubscribe;
  }, [userId, recipeId]);

  // Update completed steps
  const updateCompletedSteps = useCallback(async (completedSteps: Set<number>) => {
    setState(prev => ({ ...prev, completedSteps }));

    if (userId) {
      // Update Firestore
      try {
        await firestoreService.updateCookingSession(userId, recipeId, {
          completedSteps: Array.from(completedSteps),
          activeTimers: state.activeTimers,
        });
      } catch (error) {
        console.error('Error updating completed steps:', error);
      }
    }

    // Always update localStorage as backup
    localStorage.setItem(`cook-completed-${recipeId}`, JSON.stringify(Array.from(completedSteps)));
  }, [userId, recipeId, state.activeTimers]);

  // Update active timers
  const updateActiveTimers = useCallback(async (activeTimers: Record<number, { endTime: number; duration: string }>) => {
    setState(prev => ({ ...prev, activeTimers }));

    if (userId) {
      // Update Firestore
      try {
        await firestoreService.updateCookingSession(userId, recipeId, {
          completedSteps: Array.from(state.completedSteps),
          activeTimers,
        });
      } catch (error) {
        console.error('Error updating active timers:', error);
      }
    }

    // Always update localStorage as backup
    localStorage.setItem(`cook-timers-${recipeId}`, JSON.stringify(activeTimers));
  }, [userId, recipeId, state.completedSteps]);

  // Clear session
  const clearSession = useCallback(async () => {
    setState({
      completedSteps: new Set(),
      activeTimers: {},
      loading: false,
    });

    if (userId) {
      try {
        await firestoreService.clearCookingSession(userId, recipeId);
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }

    // Clear localStorage
    localStorage.removeItem(`cook-timers-${recipeId}`);
    localStorage.removeItem(`cook-completed-${recipeId}`);
  }, [userId, recipeId]);

  return {
    completedSteps: state.completedSteps,
    activeTimers: state.activeTimers,
    loading: state.loading,
    updateCompletedSteps,
    updateActiveTimers,
    clearSession,
  };
}
