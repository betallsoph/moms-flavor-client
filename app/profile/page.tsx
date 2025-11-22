'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer, LoadingSpinner } from '@/components/ui';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/libs/firebase';

export default function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setNewName(user.name || '');
    }
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return;

    try {
      setIsSaving(true);
      setError('');

      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create document if it doesn't exist (for existing users who logged in before this feature)
        await setDoc(userRef, {
          id: user.id,
          email: user.email,
          name: newName.trim(),
          createdAt: new Date().toISOString(),
        });
      } else {
        // Update existing document
        await updateDoc(userRef, {
          name: newName.trim(),
        });
      }

      // Refresh user data
      await refreshUser();

      setIsEditingName(false);
    } catch (err) {
      console.error('Error updating name:', err);
      setError('Không thể cập nhật tên. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNewName(user?.name || '');
    setIsEditingName(false);
    setError('');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return <LoadingSpinner color="border-blue-600" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="mb-8">
              <Image
                src="/assets/logo/logo1.png"
                alt="Profile Logo"
                width={320}
                height={320}
                className="object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-orange-800 mb-2">{user.name}</h2>
            <p className="text-orange-600 font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-6">
            {/* Edit Name Section - Only shown when editing */}
            {isEditingName && (
              <div className="bg-white border-2 border-orange-200 rounded-2xl shadow-lg p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                <h3 className="text-lg font-semibold text-orange-700 mb-4">Chỉnh sửa tên hiển thị</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nhập tên mới"
                    disabled={isSaving}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveName}
                      disabled={isSaving || !newName.trim()}
                      className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all hover:scale-[1.02]"
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 font-bold transition-all hover:scale-[1.02]"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit, Back to Home & Logout Buttons */}
            <div className="space-y-3">
              {!isEditingName && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="w-full p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
                >
                  Chỉnh sửa thông tin
                </button>
              )}

              <button
                onClick={() => router.push('/home')}
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700"
              >
                Quay lại trang chủ
              </button>

              <button
                onClick={handleLogout}
                className="w-full p-4 bg-red-100 hover:bg-red-200 border-2 border-red-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-red-700"
              >
                Đăng xuất
              </button>
            </div>
        </div>
      </main>
    </div>
  );
}
