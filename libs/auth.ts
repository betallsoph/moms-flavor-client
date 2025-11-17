// Firebase authentication service
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface User {
  id: string;
  email: string;
  name: string;
}

// Helper function to convert Firebase User to our User interface
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  };
};

// Helper function to ensure user document exists in Firestore
const ensureUserDocument = async (firebaseUser: FirebaseUser): Promise<void> => {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // Create user document if it doesn't exist
    await setDoc(userRef, {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      createdAt: new Date().toISOString(),
    });
  }
};

export const authService = {
  // Login với email và password
  login: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDocument(userCredential.user);
    // Load user data from Firestore to get latest name
    return authService.getUserData(userCredential.user.uid);
  },

  // Register với email, password và name
  register: async (name: string, email: string, password: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Cập nhật display name
    await updateProfile(userCredential.user, {
      displayName: name,
    });
    
    // Ensure user document exists in Firestore
    await ensureUserDocument(userCredential.user);
    
    // Load user data from Firestore
    return authService.getUserData(userCredential.user.uid);
  },

  // Login với Google
  loginWithGoogle: async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await ensureUserDocument(userCredential.user);
    // Load user data from Firestore
    return authService.getUserData(userCredential.user.uid);
  },

  // Phone authentication - Setup RecaptchaVerifier
  setupRecaptcha: (containerId: string): RecaptchaVerifier => {
    // Clear any existing reCAPTCHA widget first
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA verified successfully');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      },
    });

    // Render the reCAPTCHA widget
    recaptchaVerifier.render();

    return recaptchaVerifier;
  },

  // Phone authentication - Send verification code
  sendPhoneVerification: async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  },

  // Phone authentication - Verify code and login
  verifyPhoneCode: async (confirmationResult: ConfirmationResult, code: string): Promise<User> => {
    const userCredential = await confirmationResult.confirm(code);
    await ensureUserDocument(userCredential.user);
    return authService.getUserData(userCredential.user.uid);
  },

  // Đăng xuất
  logout: async () => {
    await signOut(auth);
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<User | null> => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    
    return authService.getUserData(firebaseUser.uid);
  },

  // Lấy user data từ Firestore
  getUserData: async (userId: string): Promise<User> => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const firebaseUser = auth.currentUser;
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: userId,
        email: userData.email || firebaseUser?.email || '',
        name: userData.name || firebaseUser?.displayName || 'User',
      };
    }
    
    // Fallback to Firebase Auth data if Firestore doc doesn't exist
    if (firebaseUser) {
      return mapFirebaseUser(firebaseUser);
    }
    
    // Last resort fallback
    return {
      id: userId,
      email: '',
      name: 'User',
    };
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: (): boolean => {
    return auth.currentUser !== null;
  },

  // Lắng nghe auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void | Promise<void>) => {
    return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await authService.getUserData(firebaseUser.uid);
        callback(userData);
      } else {
        callback(null);
      }
    });
  },
};
