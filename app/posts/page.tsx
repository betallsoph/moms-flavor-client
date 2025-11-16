import Link from "next/link";

export default function PostsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-white">
            Mom's Flavor
          </Link>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              Đăng nhập
            </Link>
            <Link href="/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Bộ lọc
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Khu vực
                  </label>
                  <select className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700">
                    <option>Tất cả</option>
                    <option>Quận 1</option>
                    <option>Quận 2</option>
                    <option>Quận 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Giá (VNĐ/tháng)
                  </label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Từ" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700" />
                    <input type="number" placeholder="Đến" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Loại
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Tìm người share</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Tìm phòng</span>
                    </label>
                  </div>
                </div>

                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Áp dụng
                </button>
              </div>
            </div>
          </aside>

          {/* Posts List */}
          <main className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Tất cả tin đăng
              </h1>
              <select className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700">
                <option>Mới nhất</option>
                <option>Giá thấp nhất</option>
                <option>Giá cao nhất</option>
              </select>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Link
                  key={i}
                  href={`/posts/${i}`}
                  className="block bg-white dark:bg-zinc-800 rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-700 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                        Tìm bạn nữ share phòng tại Quận {i}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                        Phòng rộng rãi, thoáng mát, gần trung tâm. Tìm bạn nữ hoà đồng, sạch sẽ...
                      </p>
                      <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                        <span>📍 Quận {i}, TP.HCM</span>
                        <span>💰 {i * 2}.000.000 đ/tháng</span>
                        <span>🕐 {i} giờ trước</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
