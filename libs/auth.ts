import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';

// Mock authentication service
export interface User {
  id: string;
  email: string;
  name: string;
}

// Helper: Convert Firebase User to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  };
};

export const authService = {
  // Đăng nhập với Firebase
  login: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = convertFirebaseUser(userCredential.user);
      
      // Lưu vào localStorage để sync với UI
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
      return user;
    } catch (error: any) {
      // Handle Firebase errors
      let errorMessage = 'Đã xảy ra lỗi khi đăng nhập';
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Email hoặc mật khẩu không đúng';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Tài khoản đã bị vô hiệu hóa';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều lần thử. Vui lòng thử lại sau';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Đăng ký với Firebase
  register: async (name: string, email: string, password: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });
      
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email || email,
        name: name,
      };
      
      // Lưu vào localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
      return user;
    } catch (error: any) {
      // Handle Firebase errors
      let errorMessage = 'Đã xảy ra lỗi khi đăng ký';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email này đã được sử dụng';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Đăng ký không được phép';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mật khẩu quá yếu. Vui lòng dùng mật khẩu mạnh hơn';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: (): User | null => {
    const currentFirebaseUser = auth.currentUser;
    
    if (currentFirebaseUser) {
      return convertFirebaseUser(currentFirebaseUser);
    }
    
    // Fallback to localStorage
    const userStr = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (isAuthenticated === 'true' && userStr) {
      return JSON.parse(userStr);
    }
    
    return null;
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: (): boolean => {
    return auth.currentUser !== null || localStorage.getItem('isAuthenticated') === 'true';
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = convertFirebaseUser(firebaseUser);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        callback(user);
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        callback(null);
      }
    });
  },

  // Đăng nhập với Google
  loginWithGoogle: async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = convertFirebaseUser(userCredential.user);
      
      // Lưu vào localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      
      return user;
    } catch (error: any) {
      let errorMessage = 'Đã xảy ra lỗi khi đăng nhập với Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Đã hủy đăng nhập';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup bị chặn. Vui lòng cho phép popup';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Đã hủy đăng nhập';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Email này đã được sử dụng với phương thức đăng nhập khác';
          break;
      }
      
      throw new Error(errorMessage);
    }
  },
};
