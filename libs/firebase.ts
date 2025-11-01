import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration từ environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDu5SPqLihdsx12gDDxUANB6X3QD-hDvKU",
  authDomain: "moms-flavor.firebaseapp.com",
  projectId: "moms-flavor",
  storageBucket: "moms-flavor.firebasestorage.app",
  messagingSenderId: "179261131575",
  appId: "1:179261131575:web:75e57b3b2e976537f6a8b2"
};

// Initialize Firebase (chỉ initialize 1 lần)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export auth instance
export const auth = getAuth(app);
export default app;
