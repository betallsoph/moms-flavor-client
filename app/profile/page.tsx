'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer, PageHeader, LoadingSpinner } from '@/components/ui';
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
    <PageContainer>
      <PageHeader
        icon="👤"
        title="Thông tin cá nhân"
        backButton={{
          label: 'Quay lại trang chủ',
          onClick: () => router.push('/home'),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-8 py-12">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-6xl">👨‍🍳</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-8 py-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
              <div className="space-y-4">
                {/* Editable Name Field */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">👤</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">Tên hiển thị</p>
                      {isEditingName ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Nhập tên mới"
                            disabled={isSaving}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveName}
                              disabled={isSaving || !newName.trim()}
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              {isSaving ? 'Đang lưu...' : '✓ Lưu'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 text-sm font-medium"
                            >
                              ✕ Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            ✏️ Sửa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✉️</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔐</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-mono text-xs text-gray-600">{user.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/recipes')}
                  className="w-full flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="font-medium text-gray-900">Công thức của tôi</p>
                    <p className="text-sm text-gray-600">Xem và quản lý công thức</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/cooking-diary')}
                  className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl">📔</span>
                  <div>
                    <p className="font-medium text-gray-900">Nhật ký nấu ăn</p>
                    <p className="text-sm text-gray-600">Xem lịch sử nấu ăn</p>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left"
                >
                  <span className="text-2xl">🚪</span>
                  <div>
                    <p className="font-medium text-red-600">Đăng xuất</p>
                    <p className="text-sm text-gray-600">Đăng xuất khỏi tài khoản</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
