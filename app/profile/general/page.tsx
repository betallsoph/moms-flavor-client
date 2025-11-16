import Link from "next/link";
import ProfileNav from "../_components/ProfileNav";

export default function GeneralInfoPage() {
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
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">
                Thông tin chung
              </h1>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      defaultValue="Nguyễn Văn A"
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Tuổi
                    </label>
                    <input
                      type="number"
                      defaultValue="25"
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Giới tính
                    </label>
                    <select className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700">
                      <option>Nam</option>
                      <option>Nữ</option>
                      <option>Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      defaultValue="0912345678"
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue="example@email.com"
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Nghề nghiệp
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Kỹ sư phần mềm"
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Nơi làm việc/Học
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Công ty ABC"
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Tình trạng hôn nhân
                    </label>
                    <select className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700">
                      <option>Độc thân</option>
                      <option>Đã kết hôn</option>
                      <option>Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Ngôn ngữ
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Tiếng Việt, English"
                      className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
