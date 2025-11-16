import Link from "next/link";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/posts" className="text-2xl font-bold text-zinc-900 dark:text-white">
            Mom's Flavor
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden">
              {/* Images */}
              <div className="aspect-video bg-zinc-200 dark:bg-zinc-700"></div>

              <div className="p-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                  Tìm bạn nữ share phòng tại Quận {id}
                </h1>

                <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-500 mb-6">
                  <span>📍 Quận {id}, TP.HCM</span>
                  <span>🕐 2 giờ trước</span>
                  <span>👁 45 lượt xem</span>
                </div>

                <div className="text-3xl font-bold text-blue-600 mb-6">
                  {Number(id) * 2}.000.000 đ/tháng
                </div>

                <div className="prose dark:prose-invert max-w-none mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                    Mô tả
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Phòng rộng rãi, thoáng mát, gần trung tâm. Đầy đủ nội thất: giường, tủ, bàn học.
                    Khu vực an ninh, yên tĩnh, gần chợ, siêu thị, trường học.
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                    Yêu cầu
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full text-sm">
                      Không hút thuốc
                    </span>
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full text-sm">
                      Sạch sẽ
                    </span>
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full text-sm">
                      Hoà đồng
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
                    Tiện ích
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <span>✓</span> Máy lạnh
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <span>✓</span> Wifi
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <span>✓</span> Máy giặt
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <span>✓</span> Bếp
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-zinc-300 dark:bg-zinc-600 rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                    Nguyễn Văn A
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Đã xác minh
                  </p>
                </div>
              </div>

              <Link
                href="/profile"
                className="block w-full py-2 px-4 border border-zinc-300 dark:border-zinc-600 rounded-lg text-center hover:bg-zinc-50 dark:hover:bg-zinc-700 mb-3"
              >
                Xem hồ sơ
              </Link>

              <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mb-2">
                Nhắn tin
              </button>

              <button className="w-full py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-700">
                Lưu tin
              </button>

              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <h4 className="font-medium text-zinc-900 dark:text-white mb-3">
                  Thông tin liên hệ
                </h4>
                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <p>📞 0912-345-678</p>
                  <p>📧 example@email.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
