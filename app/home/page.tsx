import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-black">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            Mom's Flavor
          </div>
          <div className="flex gap-6 items-center">
            <Link
              href="/posts"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Tin đăng
            </Link>
            <Link
              href="/posts/my-posts"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Tin của tôi
            </Link>
            <Link
              href="/posts/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Đăng tin
            </Link>
            <Link
              href="/profile"
              className="w-10 h-10 bg-zinc-300 dark:bg-zinc-600 rounded-full flex items-center justify-center"
            >
              <span className="text-sm font-medium">U</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Chào mừng trở lại!
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Tìm kiếm người phù hợp hoặc đăng tin của bạn ngay hôm nay
          </p>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link
              href="/posts/create"
              className="p-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Đăng tin mới</h3>
              <p className="opacity-90">Tìm người cùng share phòng, ghép nhà</p>
            </Link>
            <Link
              href="/posts"
              className="p-6 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-blue-600 transition-colors"
            >
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Duyệt tin đăng
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Xem các tin đăng mới nhất
              </p>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-1">1,234</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Tin đăng mới</div>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-1">89</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Phù hợp với bạn</div>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-1">456</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Khu vực của bạn</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
