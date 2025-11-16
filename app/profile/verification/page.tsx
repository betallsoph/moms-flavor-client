import Link from "next/link";
import ProfileNav from "../_components/ProfileNav";

export default function VerificationPage() {
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
                Xác minh danh tính
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Xác minh tài khoản để tăng độ tin cậy với người khác
              </p>

              <div className="space-y-6">
                {/* Email Verification */}
                <div className="p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          Email
                        </h3>
                        <p className="text-sm text-zinc-500">
                          example@email.com
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                      Đã xác minh
                    </span>
                  </div>
                </div>

                {/* Phone Verification */}
                <div className="p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          Số điện thoại
                        </h3>
                        <p className="text-sm text-zinc-500">
                          0912-345-678
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                      Đã xác minh
                    </span>
                  </div>
                </div>

                {/* ID Verification */}
                <div className="p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                        <span className="text-zinc-400 text-xl">📄</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          CMND/CCCD
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Tăng độ tin cậy của hồ sơ
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                      Chưa xác minh
                    </span>
                  </div>
                  <button className="w-full py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-700">
                    Xác minh ngay
                  </button>
                </div>

                {/* Social Media */}
                <div className="p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                        <span className="text-zinc-400 text-xl">🔗</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          Mạng xã hội
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Liên kết Facebook hoặc Google
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                      Chưa liên kết
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700">
                      Facebook
                    </button>
                    <button className="flex-1 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700">
                      Google
                    </button>
                  </div>
                </div>

                {/* Background Check */}
                <div className="p-6 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                        <span className="text-zinc-400 text-xl">🛡️</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          Kiểm tra lý lịch
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Xác minh an toàn cao cấp
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
                      Chưa xác minh
                    </span>
                  </div>
                  <button className="w-full py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-zinc-700">
                    Tìm hiểu thêm
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
