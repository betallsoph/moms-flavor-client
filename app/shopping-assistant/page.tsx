'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';

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
  'rau-cu': { name: '🥬 Rau - Củ', color: 'border-green-200 bg-green-50' },
  'thit-ca': { name: '🥩 Thịt - Cá', color: 'border-red-200 bg-red-50' },
  'gia-vi': { name: '🧂 Gia vị', color: 'border-yellow-200 bg-yellow-50' },
  'khac': { name: '📦 Khác', color: 'border-gray-200 bg-gray-50' },
};

export default function ShoppingAssistantPage() {
  const router = useRouter();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('cái');
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
    setNewItemUnit('cái');
    setNewItemCategory('khac');
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

  const handleClearAll = () => {
    if (confirm('Xóa toàn bộ danh sách?')) {
      saveItems([]);
    }
  };

  // Group items by category
  const itemsByCategory = Object.keys(CATEGORIES).reduce((acc, category) => {
    acc[category as keyof typeof CATEGORIES] = items.filter((item) => item.category === category);
    return acc;
  }, {} as Record<keyof typeof CATEGORIES, ShoppingItem[]>);

  const checkedCount = items.filter((item) => item.checked).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <PageHeader
        icon="🛒"
        title="Trợ lý đi chợ"
        backButton={{
          label: 'Quay lại trang chủ',
          onClick: () => router.push('/home'),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Info Note */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-900">
            ℹ️ ân sẽ tuning một model của naver để nó trả về chỉ mỗi danh sách đi chợ thôi, và giới hạn đầu vào cho nó trả lời đúng dựa trên các công thức đã có
          </p>
        </div>
        {/* Progress Bar */}
        {items.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-900">
                ✓ Đã mua {checkedCount}/{items.length} mục
              </p>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round((checkedCount / items.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-600 h-full transition-all duration-300"
                style={{ width: `${(checkedCount / items.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Add Item Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm mục mới</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Tên mục (ví dụ: Cà chua)"
                className="col-span-1 md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                {Object.entries(CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                placeholder="Số lượng"
                min="1"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              <input
                type="text"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                placeholder="Đơn vị (cái, kg, lít...)"
                className="col-span-1 md:col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            <button
              onClick={handleAddItem}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow"
            >
              + Thêm vào danh sách
            </button>
          </div>
        </div>

        {/* Shopping List */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🛒</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                Danh sách trống
              </h3>
              <p className="text-gray-500 mb-8">
                Hãy thêm những mục bạn cần mua từ trên!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(CATEGORIES).map(([categoryKey, categoryInfo]) => {
              const categoryItems = itemsByCategory[categoryKey as keyof typeof CATEGORIES];
              if (categoryItems.length === 0) return null;

              return (
                <div key={categoryKey} className={`rounded-2xl border p-6 ${categoryInfo.color}`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{categoryInfo.name}</h3>
                  <div className="space-y-3">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleItem(item.id)}
                          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                        />
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              item.checked
                                ? 'line-through text-gray-400'
                                : 'text-gray-900'
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm px-3 py-1"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        {items.length > 0 && (
          <div className="mt-12 flex gap-4 justify-center">
            {checkedCount > 0 && (
              <button
                onClick={handleClearCompleted}
                className="px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                🗑️ Xóa những mục đã mua
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-colors"
            >
              🗑️ Xóa toàn bộ
            </button>
          </div>
        )}
      </main>
    </PageContainer>
  );
}
