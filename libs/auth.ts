// Firebase authentication service
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './firebase';

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

export const authService = {
  // Login với email và password
  login: async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(userCredential.user);
  },

  // Register với email, password và name
  register: async (name: string, email: string, password: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Cập nhật display name
    await updateProfile(userCredential.user, {
      displayName: name,
    });
    
    return mapFirebaseUser(userCredential.user);
  },

  // Login với Google
  loginWithGoogle: async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return mapFirebaseUser(userCredential.user);
  },

  // Đăng xuất
  logout: async () => {
    await signOut(auth);
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: (): User | null => {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: (): boolean => {
    return auth.currentUser !== null;
  },

  // Lắng nghe auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  },
};
