import Link from "next/link";
import ProfileNav from "../_components/ProfileNav";

export default function SettingsPage() {
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
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
                Cài đặt tài khoản
              </h1>

              <div className="space-y-8">
                {/* Account Settings */}
                <section>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                    Tài khoản
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white">
                          Đổi mật khẩu
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Cập nhật mật khẩu của bạn
                        </p>
                      </div>
                      <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-700 rounded-lg">
                        Thay đổi
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white">
                          Xóa tài khoản
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Xóa vĩnh viễn tài khoản của bạn
                        </p>
                      </div>
                      <button className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-zinc-700 rounded-lg">
                        Xóa
                      </button>
                    </div>
                  </div>
                </section>

                {/* Privacy Settings */}
                <section>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                    Quyền riêng tư
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white">
                          Hiển thị hồ sơ
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Cho phép người khác xem hồ sơ của bạn
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white">
                          Hiển thị số điện thoại
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Cho phép người khác xem số điện thoại
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Notification Settings */}
                <section>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                    Thông báo
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white">
                          Email thông báo
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Nhận thông báo qua email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white">
                          Tin nhắn mới
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Thông báo khi có tin nhắn mới
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-zinc-900 dark:text-white">
                          Tin đăng phù hợp
                        </h3>
                        <p className="text-sm text-zinc-500">
                          Thông báo tin đăng phù hợp với bạn
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Language & Region */}
                <section>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                    Ngôn ngữ & Khu vực
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Ngôn ngữ
                      </label>
                      <select className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700">
                        <option>Tiếng Việt</option>
                        <option>English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Múi giờ
                      </label>
                      <select className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700">
                        <option>GMT+7 (Vietnam)</option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
