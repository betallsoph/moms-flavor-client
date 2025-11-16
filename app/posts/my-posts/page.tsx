import Link from "next/link";

export default function MyPostsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home" className="text-2xl font-bold text-zinc-900 dark:text-white">
            Mom's Flavor
          </Link>
          <Link
            href="/posts/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng tin mới
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          Tin đăng của tôi
        </h1>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-800 rounded-xl p-6"
            >
              <div className="flex gap-4">
                <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-700 rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Tìm bạn nữ share phòng tại Quận {i}
                    </h3>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full">
                      Đang hoạt động
                    </span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-3">
                    Phòng rộng rãi, thoáng mát, gần trung tâm...
                  </p>
                  <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-500 mb-4">
                    <span>📍 Quận {i}, TP.HCM</span>
                    <span>💰 {i * 2}.000.000 đ/tháng</span>
                    <span>👁 {i * 15} lượt xem</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/posts/${i}`}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded-lg"
                    >
                      Xem
                    </Link>
                    <button className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg">
                      Chỉnh sửa
                    </button>
                    <button className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-zinc-700 rounded-lg">
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {/* <div className="text-center py-16">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">
            Bạn chưa có tin đăng nào
          </p>
          <Link
            href="/posts/create"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng tin đầu tiên
          </Link>
        </div> */}
      </div>
    </div>
  );
}
