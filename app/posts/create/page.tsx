import Link from "next/link";

export default function CreatePostPage() {
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

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          Đăng tin tìm người
        </h1>

        <form className="bg-white dark:bg-zinc-800 rounded-xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tiêu đề tin đăng
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-zinc-700"
              placeholder="VD: Tìm bạn nữ share phòng tại Quận 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Loại tin đăng
            </label>
            <select className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700">
              <option>Tìm người share phòng</option>
              <option>Tìm phòng để thuê</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Khu vực
              </label>
              <select className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700">
                <option>Quận 1</option>
                <option>Quận 2</option>
                <option>Quận 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Giá (VNĐ/tháng)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                placeholder="VD: 3000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              rows={6}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
              placeholder="Mô tả về phòng, vị trí, tiện ích, yêu cầu về người cùng ở..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Yêu cầu về người cùng ở
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Không hút thuốc</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Không nuôi thú cưng</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Sạch sẽ</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Hình ảnh
            </label>
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-8 text-center">
              <p className="text-zinc-500">Kéo thả hoặc click để tải ảnh lên</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Đăng tin
            </button>
            <Link
              href="/home"
              className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
