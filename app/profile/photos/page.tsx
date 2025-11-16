import Link from "next/link";
import ProfileNav from "../_components/ProfileNav";

export default function PhotosPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <nav className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/home" className="text-2xl font-bold text-zinc-900 dark:text-white">
            Mom's Flavor
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <ProfileNav />
          </aside>

          <main className="md:col-span-3">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-8">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                Ảnh của bạn
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Thêm ảnh để hồ sơ của bạn nổi bật hơn
              </p>

              {/* Profile Photo */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Ảnh đại diện
                </h3>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-700 rounded-full flex-shrink-0"></div>
                  <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2">
                      Tải ảnh lên
                    </button>
                    <p className="text-sm text-zinc-500">
                      Ảnh JPG, PNG. Tối đa 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Gallery */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Thư viện ảnh
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-square bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
                      <button className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                    </div>
                  ))}
                  <button className="aspect-square border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700">
                    <div className="text-center">
                      <div className="text-3xl text-zinc-400 mb-1">+</div>
                      <div className="text-sm text-zinc-500">Thêm ảnh</div>
                    </div>
                  </button>
                </div>

                <p className="text-sm text-zinc-500">
                  Tối đa 10 ảnh. Ảnh JPG, PNG. Tối đa 5MB mỗi ảnh
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
