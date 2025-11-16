import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-black">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            Mom's Flavor
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-zinc-900 dark:text-white mb-6">
            Tìm người share phòng, ghép nhà dễ dàng
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            Kết nối với những người cùng chí hướng, tìm không gian sống phù hợp với bạn
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/posts"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
            >
              Xem tin đăng
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-800 text-lg"
            >
              Bắt đầu ngay
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
              Dễ dàng tìm kiếm
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Lọc theo vị trí, giá, lối sống để tìm người phù hợp
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
              Hồ sơ chi tiết
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Xem thông tin lối sống, sở thích của người cùng ở
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
              An toàn & tin cậy
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Xác minh danh tính, đánh giá từ cộng đồng
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
