import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-white">
            Mom's Flavor
          </Link>
          <h2 className="text-xl text-zinc-600 dark:text-zinc-400 mt-2">
            Đăng nhập vào tài khoản
          </h2>
        </div>

        <form className="space-y-6">
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
              Mật khẩu
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-600 dark:bg-zinc-700 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Ghi nhớ đăng nhập</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
