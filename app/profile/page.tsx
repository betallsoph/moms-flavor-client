import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/home" className="text-2xl font-bold text-zinc-900 dark:text-white">
            Mom's Flavor
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 sticky top-8">
              <nav className="space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg font-medium"
                >
                  Tổng quan
                </Link>
                <Link
                  href="/profile/general"
                  className="block px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg"
                >
                  Thông tin chung
                </Link>
                <Link
                  href="/profile/lifestyle"
                  className="block px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg"
                >
                  Lối sống
                </Link>
                <Link
                  href="/profile/preferences"
                  className="block px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg"
                >
                  Sở thích & mong muốn
                </Link>
                <Link
                  href="/profile/about"
                  className="block px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg"
                >
                  Giới thiệu bản thân
                </Link>
                <Link
                  href="/profile/photos"
                  className="block px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg"
                >
                  Ảnh
                </Link>
                <Link
                  href="/profile/verification"
                  className="block px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg"
                >
                  Xác minh
                </Link>
                <Link
                  href="/profile/settings"
                  className="block px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-lg"
                >
                  Cài đặt
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-8">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
                Hồ sơ của tôi
              </h1>

              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-700">
                <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-700 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
                    Nguyễn Văn A
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    Member since 2024 • Đã xác minh
                  </p>
                  <div className="flex gap-4">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                      ✓ Email
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                      ✓ Số điện thoại
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                    3
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Tin đăng
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                    85%
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Hoàn thành hồ sơ
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-700 rounded-lg">
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                    4.5
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Đánh giá
                  </div>
                </div>
              </div>

              {/* Profile Sections Status */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Hoàn thiện hồ sơ
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/profile/general"
                    className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-blue-600"
                  >
                    <span className="text-zinc-900 dark:text-white">Thông tin chung</span>
                    <span className="text-green-600">✓ Hoàn thành</span>
                  </Link>
                  <Link
                    href="/profile/lifestyle"
                    className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-blue-600"
                  >
                    <span className="text-zinc-900 dark:text-white">Lối sống</span>
                    <span className="text-green-600">✓ Hoàn thành</span>
                  </Link>
                  <Link
                    href="/profile/preferences"
                    className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-blue-600"
                  >
                    <span className="text-zinc-900 dark:text-white">Sở thích & mong muốn</span>
                    <span className="text-yellow-600">⚠ Cần cập nhật</span>
                  </Link>
                  <Link
                    href="/profile/about"
                    className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-blue-600"
                  >
                    <span className="text-zinc-900 dark:text-white">Giới thiệu bản thân</span>
                    <span className="text-green-600">✓ Hoàn thành</span>
                  </Link>
                  <Link
                    href="/profile/photos"
                    className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-blue-600"
                  >
                    <span className="text-zinc-900 dark:text-white">Ảnh</span>
                    <span className="text-yellow-600">⚠ Cần cập nhật</span>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
