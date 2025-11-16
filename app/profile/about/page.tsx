import Link from "next/link";
import ProfileNav from "../_components/ProfileNav";

export default function AboutPage() {
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
                Giới thiệu bản thân
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Hãy kể về bản thân để người khác hiểu rõ hơn về bạn
              </p>

              <form className="space-y-6">
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Giới thiệu chung
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 focus:ring-2 focus:ring-blue-600"
                    placeholder="VD: Tôi là một người thích sạch sẽ, hoà đồng, dễ gần. Thích nấu ăn và xem phim vào cuối tuần..."
                  ></textarea>
                  <p className="text-sm text-zinc-500 mt-1">Tối thiểu 100 ký tự</p>
                </div>

                {/* Hobbies */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Sở thích
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 focus:ring-2 focus:ring-blue-600"
                    placeholder="VD: Đọc sách, xem phim, chạy bộ, nấu ăn..."
                  ></textarea>
                </div>

                {/* Music Taste */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Thể loại nhạc yêu thích
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    placeholder="VD: Pop, Rock, Classical..."
                  />
                </div>

                {/* Movies/Shows */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Phim/Show yêu thích
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    placeholder="VD: Friends, Breaking Bad..."
                  />
                </div>

                {/* Fun Fact */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Điều thú vị về bạn
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 focus:ring-2 focus:ring-blue-600"
                    placeholder="Chia sẻ một điều thú vị về bản thân..."
                  ></textarea>
                </div>

                {/* What makes you a good roommate */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Điều gì khiến bạn là một người bạn cùng phòng tốt?
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 focus:ring-2 focus:ring-blue-600"
                    placeholder="VD: Tôi luôn tôn trọng không gian riêng tư, giữ gìn vệ sinh chung, sẵn sàng chia sẻ và hỗ trợ..."
                  ></textarea>
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
