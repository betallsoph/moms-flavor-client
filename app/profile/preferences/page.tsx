import Link from "next/link";
import ProfileNav from "../_components/ProfileNav";

export default function PreferencesPage() {
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
                Sở thích & mong muốn
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                Cho chúng tôi biết bạn đang tìm kiếm điều gì
              </p>

              <form className="space-y-8">
                {/* Looking For */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Đang tìm kiếm
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Tìm người share phòng</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Tìm phòng để thuê</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Tìm nhà để share</span>
                    </label>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Ngân sách (VNĐ/tháng)
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Từ"
                      className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    />
                  </div>
                </div>

                {/* Preferred Locations */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Khu vực ưa thích
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {["Quận 1", "Quận 2", "Quận 3", "Quận 7", "Bình Thạnh", "Phú Nhuận"].map((area) => (
                      <label key={area} className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Move-in Date */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Ngày có thể chuyển đến
                  </label>
                  <input
                    type="date"
                    className="w-full md:w-1/2 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                  />
                </div>

                {/* Roommate Preferences */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Tìm bạn cùng phòng
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="gender" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Nam</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="gender" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Nữ</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="gender" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Không quan trọng</span>
                    </label>
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Độ tuổi ưa thích
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Từ"
                      className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700"
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Yêu cầu đặc biệt
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Không hút thuốc</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Không nuôi thú cưng</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Yên tĩnh</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-zinc-700 dark:text-zinc-300">Sạch sẽ</span>
                    </label>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    Tiện ích mong muốn
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Wifi", "Máy lạnh", "Máy giặt", "Bếp", "Tủ lạnh", "Gần siêu thị", "Gần trung tâm", "Có chỗ đậu xe"].map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2">
                        <input type="checkbox" className="w-4 h-4" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{amenity}</span>
                      </label>
                    ))}
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
