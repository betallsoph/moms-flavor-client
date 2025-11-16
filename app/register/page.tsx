import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-white">
            Mom's Flavor
          </Link>
          <h2 className="text-xl text-zinc-600 dark:text-zinc-400 mt-2">
            Tạo tài khoản mới
          </h2>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Họ tên
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-zinc-700 dark:text-white"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-zinc-700 dark:text-white"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-zinc-700 dark:text-white"
              placeholder="0912345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-zinc-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-zinc-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start">
            <input type="checkbox" className="mt-1 mr-2" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Tôi đồng ý với{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Chính sách bảo mật
              </a>
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Đăng ký
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
