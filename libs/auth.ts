// Mock authentication service (NO FIREBASE)
export interface User {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  // Mock login - chấp nhận bất kỳ thông tin nào
  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email || 'user@app.com',
      name: email.split('@')[0] || email || 'User',
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    return user;
  },

  // Mock register - chấp nhận bất kỳ thông tin nào
  register: async (name: string, email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email || 'user@app.com',
      name: name || 'User',
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    return user;
  },

  // Mock Google login - tự động tạo user
  loginWithGoogle: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: `user${Math.random().toString(36).substr(2, 5)}@gmail.com`,
      name: `Google User ${Math.random().toString(36).substr(2, 5)}`,
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    return user;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (isAuthenticated === 'true' && userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: (): boolean => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  // Lắng nghe auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    const currentUser = authService.getCurrentUser();
    callback(currentUser);
    return () => {};
  },
};
