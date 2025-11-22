'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: 'rau-cu' | 'thit-ca' | 'gia-vi' | 'khac';
  checked: boolean;
  createdAt: string;
}

const CATEGORIES = {
  'rau-cu': { name: 'Rau - Củ', emoji: '🥬' },
  'thit-ca': { name: 'Thịt - Cá', emoji: '🥩' },
  'gia-vi': { name: 'Gia vị', emoji: '🧂' },
  'khac': { name: 'Khác', emoji: '📦' },
};

export default function ShoppingAssistantPage() {
  const router = useRouter();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'rau-cu' | 'thit-ca' | 'gia-vi' | 'khac'>('khac');

  const loadItems = () => {
    const saved = localStorage.getItem('shopping-list') || '[]';
    const parsed = JSON.parse(saved);
    setItems(parsed);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const saveItems = (updatedItems: ShoppingItem[]) => {
    localStorage.setItem('shopping-list', JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      quantity: newItemQuantity,
      unit: newItemUnit,
      category: newItemCategory,
      checked: false,
      createdAt: new Date().toISOString(),
    };

    saveItems([...items, newItem]);
    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemUnit('');
    setNewItemCategory('khac');
    setShowAddForm(false);
  };

  const handleToggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    saveItems(items.filter((item) => item.id !== id));
  };

  const handleClearCompleted = () => {
    saveItems(items.filter((item) => !item.checked));
  };

  // Group items by category
  const itemsByCategory = Object.keys(CATEGORIES).reduce((acc, category) => {
    acc[category as keyof typeof CATEGORIES] = items.filter((item) => item.category === category);
    return acc;
  }, {} as Record<keyof typeof CATEGORIES, ShoppingItem[]>);

  const checkedCount = items.filter((item) => item.checked).length;
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Floating Back Button - Moved higher */}
      <button
        onClick={() => router.push('/home')}
        className="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all"
        aria-label="Quay lại trang chủ"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12 pb-32">
        {/* Cute Header */}
        <div className="mb-12">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                <span className="text-2xl">🛒</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">Danh sách mua sắm</h1>
                {items.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <span className="font-semibold text-gray-900">{checkedCount}</span>
                    <span>/</span>
                    <span>{items.length}</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">Ghi chép thật nhanh, mua sắm thật vui</p>
            </div>
          </div>
          {items.length > 0 && (
            <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-gray-800 to-gray-900 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
              {progress > 0 && progress < 100 && (
                <div
                  className="absolute h-full w-2 bg-white/50 rounded-full blur-sm"
                  style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                />
              )}
            </div>
          )}
        </div>

        {/* Shopping List */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-40">🛒</div>
            <p className="text-gray-400 text-base">Chưa có gì trong danh sách</p>
          </div>
        ) : (
          <div className="space-y-8 mb-8">
            {Object.entries(CATEGORIES).map(([categoryKey, categoryInfo]) => {
              const categoryItems = itemsByCategory[categoryKey as keyof typeof CATEGORIES];
              if (categoryItems.length === 0) return null;

              return (
                <div key={categoryKey} className="space-y-3">
                  {/* Category Header - Minimal */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xl opacity-70">{categoryInfo.emoji}</span>
                    <h3 className="text-sm font-medium text-gray-600">
                      {categoryInfo.name}
                    </h3>
                    <div className="ml-auto text-xs text-gray-400">
                      {categoryItems.length}
                    </div>
                  </div>

                  {/* Category Items - Minimal white cards */}
                  <div className="space-y-2">
                    {categoryItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`group relative bg-white border border-gray-200 rounded-xl p-4 transition-all hover:shadow-md hover:border-gray-300 ${
                          item.checked ? 'opacity-50' : ''
                        }`}
                        style={{
                          animation: `slideInUp 0.3s ease-out ${index * 0.05}s backwards`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Checkbox - Minimal */}
                          <button
                            onClick={() => handleToggleItem(item.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 ${
                              item.checked
                                ? 'border-gray-900 bg-gray-900'
                                : 'border-gray-300 bg-white'
                            } flex items-center justify-center transition-all hover:scale-110`}
                          >
                            {item.checked && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          {/* Item Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-gray-900 ${item.checked ? 'line-through' : ''}`}>
                              {item.name}
                            </p>
                            {(item.quantity || item.unit) && (
                              <p className="text-sm text-gray-400 mt-0.5">
                                {item.quantity} {item.unit}
                              </p>
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center transition-all hover:bg-gray-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Clear Completed Button */}
        {checkedCount > 0 && (
          <div className="text-center">
            <button
              onClick={handleClearCompleted}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-600 rounded-full border border-gray-200 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Xoá đã mua ({checkedCount})</span>
            </button>
          </div>
        )}
      </main>

      {/* Floating Add Button - Minimal */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`w-14 h-14 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 hover:shadow-xl ${
            showAddForm ? 'rotate-45' : ''
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Add Item Modal - Minimal */}
      {showAddForm && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            onClick={() => setShowAddForm(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Thêm món mới</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên món</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Cà chua"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CATEGORIES).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setNewItemCategory(key as any)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                        newItemCategory === key
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{val.emoji}</span>
                      <span className="text-sm font-medium">{val.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
                  <input
                    type="text"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    placeholder="1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đơn vị</label>
                  <input
                    type="text"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="kg"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
                className="w-full py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
              >
                Thêm vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
