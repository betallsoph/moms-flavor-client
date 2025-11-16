"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/profile", label: "Tổng quan" },
    { href: "/profile/general", label: "Thông tin chung" },
    { href: "/profile/lifestyle", label: "Lối sống" },
    { href: "/profile/preferences", label: "Sở thích & mong muốn" },
    { href: "/profile/about", label: "Giới thiệu bản thân" },
    { href: "/profile/photos", label: "Ảnh" },
    { href: "/profile/verification", label: "Xác minh" },
    { href: "/profile/settings", label: "Cài đặt" },
  ];

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 sticky top-8">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-2 rounded-lg ${
              pathname === item.href
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
