'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/libs/auth';
import Image from 'next/image';

const diagonalStickers = [
  // Left edge column
  { src: '/assets/sticker2/dĩa thịt kho trứng.png', col: -1, row: 0 },
  { src: '/assets/sticker2/ếch xào ớt.png', col: -1, row: 1 },
  { src: '/assets/sticker2/gà sốt mắm.png', col: -1, row: 2 },
  { src: '/assets/sticker2/gỏi cá.png', col: -1, row: 3 },
  { src: '/assets/sticker2/giá xào huyết.png', col: -1, row: 4 },

  // Main grid
  { src: '/assets/sticker2/bánh bao xá xíu.png', col: 0, row: 0 },
  { src: '/assets/sticker2/bò kho.png', col: 1, row: 0 },
  { src: '/assets/sticker2/bún mắm.png', col: 2, row: 0 },
  { src: '/assets/sticker2/cá kho tiêu.png', col: 3, row: 0 },
  { src: '/assets/sticker2/cơm chiên dương châu.png', col: 4, row: 0 },

  { src: '/assets/sticker2/gà kho xã ớt.png', col: 0, row: 1 },
  { src: '/assets/sticker2/gỏi cuốn kèm sốt.png', col: 1, row: 1 },
  { src: '/assets/sticker2/khoai tây chiên.png', col: 2, row: 1 },
  { src: '/assets/sticker2/bánh canh cua.png', col: 3, row: 1 },
  { src: '/assets/sticker2/bạch tuộc nướng.png', col: 4, row: 1 },

  { src: '/assets/sticker2/bí đao xào.png', col: 0, row: 2 },
  { src: '/assets/sticker2/bò xào lơ.png', col: 1, row: 2 },
  { src: '/assets/sticker2/canh củ.png', col: 2, row: 2 },
  { src: '/assets/sticker2/cá thu sốt cà.png', col: 3, row: 2 },
  { src: '/assets/sticker2/cháo thập cẩm.png', col: 4, row: 2 },

  { src: '/assets/sticker2/chân gà xã tắc.png', col: 0, row: 3 },
  { src: '/assets/sticker2/cơm cuộn.png', col: 1, row: 3 },
  { src: '/assets/sticker2/cua hấp bia.png', col: 2, row: 3 },
  { src: '/assets/sticker2/heo giả cầy.png', col: 3, row: 3 },
  { src: '/assets/sticker2/khoai tây đút lò.png', col: 4, row: 3 },

  { src: '/assets/sticker2/gỏi gà bắp cải.png', col: 0, row: 4 },
  { src: '/assets/sticker2/cơm cuộn.png', col: 1, row: 4 },
  { src: '/assets/sticker2/cháo thập cẩm.png', col: 2, row: 4 },
  { src: '/assets/sticker2/bạch tuộc nướng.png', col: 3, row: 4 },
  { src: '/assets/sticker2/bánh canh cua.png', col: 4, row: 4 },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [phoneStep, setPhoneStep] = useState<'phone' | 'code' | 'profile'>('phone');
  const [newUserProfile, setNewUserProfile] = useState({ name: '', email: '' });
  const [tempUserId, setTempUserId] = useState<string>('');
  const recaptchaVerifierRef = useRef<any>(null);
  const { login, loginWithGoogle, refreshUser } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Chuyển đến trang chủ sau khi đăng nhập thành công
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng nhập với Google');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    setShowPhoneModal(true);
    setPhoneStep('phone');
    setPhoneNumber('+84');
    setVerificationCode('');
    setError('');
  };

  // Initialize reCAPTCHA when modal opens
  useEffect(() => {
    if (showPhoneModal && phoneStep === 'phone') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        try {
          if (!recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = authService.setupRecaptcha('recaptcha-container');
          }
        } catch (error) {
          console.error('Failed to setup reCAPTCHA:', error);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        // Cleanup reCAPTCHA when modal closes
        if (recaptchaVerifierRef.current) {
          try {
            recaptchaVerifierRef.current.clear();
          } catch (e) {
            console.error('Error clearing reCAPTCHA:', e);
          }
          recaptchaVerifierRef.current = null;
        }
      };
    }
  }, [showPhoneModal, phoneStep]);

  const handleSendVerificationCode = async () => {
    setError('');
    setLoading(true);

    try {
      if (!recaptchaVerifierRef.current) {
        throw new Error('reCAPTCHA not initialized');
      }

      // Send verification code using pre-initialized reCAPTCHA
      const confirmation = await authService.sendPhoneVerification(phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setPhoneStep('code');
    } catch (err: any) {
      // Custom error messages in Vietnamese
      if (err.code === 'auth/invalid-phone-number') {
        setError('Số điện thoại không đúng định dạng');
      } else if (err.code === 'auth/missing-phone-number') {
        setError('Vui lòng nhập số điện thoại');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Quá nhiều yêu cầu. Vui lòng thử lại sau');
      } else {
        setError('Không thể gửi mã xác nhận. Vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);

    try {
      const user = await authService.verifyPhoneCode(confirmationResult, verificationCode);

      // Check if this is a new user (no name set)
      if (!user.name || user.name === 'User' || user.email === '') {
        // New user - show profile completion step
        setTempUserId(user.id);
        setPhoneStep('profile');
        setNewUserProfile({ name: '', email: '' });
      } else {
        // Existing user - proceed to home
        setShowPhoneModal(false);
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Mã xác nhận không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    setError('');
    setLoading(true);

    try {
      // Update user profile in Firestore
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/libs/firebase');

      const userRef = doc(db, 'users', tempUserId);
      await updateDoc(userRef, {
        name: newUserProfile.name,
        email: newUserProfile.email || '',
      });

      // Refresh user data in AuthContext to get updated name
      await refreshUser();

      setShowPhoneModal(false);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = email.trim() !== '' && password.trim() !== '';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-12 overflow-hidden">
      {/* Diagonal Scrolling Stickers - Infinite Loop */}
      {diagonalStickers.map((sticker, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: `${sticker.col * 20}%`,
            top: `-150px`,
            animation: `infiniteScroll 15s linear infinite`,
            animationDelay: `${-(sticker.row * 3 + sticker.col * 0.5)}s`,
          }}
        >
          <Image
            src={sticker.src}
            alt="food decoration"
            width={120}
            height={120}
            className="w-32 h-32 object-contain drop-shadow-lg"
          />
        </div>
      ))}

      {/* Duplicate for seamless loop */}
      {diagonalStickers.map((sticker, index) => (
        <div
          key={`dup-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: `${sticker.col * 20}%`,
            top: `-150px`,
            animation: `infiniteScroll 15s linear infinite`,
            animationDelay: `${-(sticker.row * 3 + sticker.col * 0.5 + 7.5)}s`,
          }}
        >
          <Image
            src={sticker.src}
            alt="food decoration"
            width={120}
            height={120}
            className="w-32 h-32 object-contain drop-shadow-lg"
          />
        </div>
      ))}

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border-[3px] border-orange-400 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/assets/logo/logo8.png"
                alt="Mom's Flavor Logo"
                width={400}
                height={400}
                className="w-48 h-48 md:w-80 md:h-80 object-contain drop-shadow-2xl"
              />
            </div>

            {/* Form Column */}
            <div className="flex-1 w-full">
              <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100/50 backdrop-blur-sm border-2 border-red-300 text-red-800 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-orange-800 mb-2">
                Email hoặc tên đăng nhập
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                placeholder="Nhập email hoặc tên"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-orange-800 mb-2">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start justify-start">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                Quên mật khẩu? Nhấn vô đây ngay!
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 bg-white text-orange-700 rounded-xl hover:scale-105 focus:ring-4 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg border-[3px] border-orange-400 ${
                isFormFilled ? 'hover:bg-orange-400 hover:text-white' : 'hover:bg-orange-50'
              }`}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <Link
              href="/auth/register"
              className="block w-full py-3 px-6 bg-white/40 backdrop-blur-sm text-orange-600 rounded-xl hover:bg-white/60 hover:text-orange-700 transition-all font-semibold text-sm border-2 border-orange-200 text-center"
            >
              Chưa có tài khoản? Đăng ký ngay
            </Link>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-orange-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/40 backdrop-blur-sm text-orange-700 font-semibold">Hoặc đăng nhập với</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-orange-800 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={handlePhoneLogin}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-orange-800 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25 1.12.37 2.32.57 3.57.57.55 0 1 .45 1 1v3.49c0 .55-.45 1-1 1C10.41 21 3 13.59 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                Số điện thoại
              </button>
            </div>
          </div>

          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container"></div>

          {/* Phone Authentication Modal */}
          {showPhoneModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border-[3px] border-orange-400 p-6 md:p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-orange-800">
                    {phoneStep === 'phone' && 'Nhập số điện thoại'}
                    {phoneStep === 'code' && 'Nhập mã xác nhận'}
                    {phoneStep === 'profile' && 'Hoàn tất thông tin'}
                  </h3>
                  <button
                    onClick={() => setShowPhoneModal(false)}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="bg-red-100/50 backdrop-blur-sm border-2 border-red-300 text-red-800 px-4 py-3 rounded-xl mb-4">
                    {error}
                  </div>
                )}

                {phoneStep === 'profile' ? (
                  <div className="space-y-4">
                    <p className="text-sm text-orange-700 mb-4">
                      Chào mừng bạn đến với Mom's Flavor! Vui lòng điền thông tin để hoàn tất đăng ký.
                    </p>
                    <div>
                      <label htmlFor="profile-name" className="block text-sm font-semibold text-orange-800 mb-2">
                        Tên của bạn *
                      </label>
                      <input
                        id="profile-name"
                        type="text"
                        value={newUserProfile.name}
                        onChange={(e) => setNewUserProfile({ ...newUserProfile, name: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-email" className="block text-sm font-semibold text-orange-800 mb-2">
                        Email (tùy chọn)
                      </label>
                      <input
                        id="profile-email"
                        type="email"
                        value={newUserProfile.email}
                        onChange={(e) => setNewUserProfile({ ...newUserProfile, email: e.target.value })}
                        placeholder="example@email.com"
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                      />
                    </div>
                    <button
                      onClick={handleCompleteProfile}
                      disabled={loading || !newUserProfile.name.trim()}
                      className="w-full py-3 px-6 bg-orange-400 text-white rounded-xl hover:bg-orange-500 hover:scale-105 focus:ring-4 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg border-2 border-orange-500"
                    >
                      {loading ? 'Đang lưu...' : 'Hoàn tất'}
                    </button>
                  </div>
                ) : phoneStep === 'phone' ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-orange-800 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Ensure +84 is always at the start
                          if (value.startsWith('+84')) {
                            setPhoneNumber(value);
                          } else if (!value.startsWith('+')) {
                            setPhoneNumber('+84' + value);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevent deleting +84
                          if ((e.key === 'Backspace' || e.key === 'Delete') && phoneNumber === '+84') {
                            e.preventDefault();
                          }
                        }}
                        placeholder="+84 123 456 789"
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                      />
                    </div>

                    <button
                      onClick={handleSendVerificationCode}
                      disabled={loading || !phoneNumber}
                      className="w-full py-3 px-6 bg-orange-400 text-white rounded-xl hover:bg-orange-500 hover:scale-105 focus:ring-4 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg border-2 border-orange-500"
                    >
                      {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="code" className="block text-sm font-semibold text-orange-800 mb-2">
                        Mã xác nhận
                      </label>
                      <input
                        id="code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder=""
                        className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                      />
                    </div>
                    <button
                      onClick={handleVerifyCode}
                      disabled={loading || !verificationCode}
                      className="w-full py-3 px-6 bg-orange-400 text-white rounded-xl hover:bg-orange-500 hover:scale-105 focus:ring-4 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg border-2 border-orange-500"
                    >
                      {loading ? 'Đang xác nhận...' : 'Xác nhận'}
                    </button>
                    <button
                      onClick={() => setPhoneStep('phone')}
                      className="w-full py-2 text-sm text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      ← Quay lại nhập số điện thoại
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
            </div>
          </div>
        </div>

        {/* Back to Welcome Card */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white/70 backdrop-blur-md border-2 border-orange-300 rounded-2xl text-orange-700 hover:bg-orange-50 hover:border-orange-400 font-bold transition-all hover:scale-105"
          >
            Welcome
          </Link>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx global>{`
        @keyframes infiniteScroll {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            transform: translate(30vw, calc(100vh + 150px)) rotate(20deg);
          }
        }

        /* Hide reCAPTCHA badge */
        .grecaptcha-badge {
          visibility: hidden !important;
        }
      `}</style>
    </div>
  );
}
