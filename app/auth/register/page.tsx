'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      // Chuyển đến trang chủ sau khi đăng ký thành công
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng ký với Google');
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled =
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12">
      <div className="w-full max-w-5xl mx-auto px-6">
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border-[3px] border-orange-400 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/assets/logo/logo6.png"
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

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-orange-800 mb-2">
                  Tên của bạn
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-orange-800 mb-2">
                  Email hoặc tên đăng nhập
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                  placeholder="Nhập email hoặc tên"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-orange-800 mb-2">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                  placeholder="••••••••"
                />
                <p className="mt-1 text-xs text-orange-600">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-orange-800 mb-2">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none text-base transition-all text-orange-900 placeholder:text-orange-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 bg-white text-orange-700 rounded-xl hover:scale-105 focus:ring-4 focus:ring-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg border-[3px] border-orange-400 ${
                isFormFilled ? 'hover:bg-orange-400 hover:text-white' : 'hover:bg-orange-50'
              }`}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>

            <Link
              href="/auth/login"
              className="block w-full py-3 px-6 bg-white/40 backdrop-blur-sm text-orange-600 rounded-xl hover:bg-white/60 hover:text-orange-700 transition-all font-semibold text-sm border-2 border-orange-200 text-center"
            >
              Đã có tài khoản? Quay về trang đăng nhập
            </Link>
          </form>
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
    </div>
  );
}
