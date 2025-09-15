"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  FileText,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Logout } from "@/service/auth.service";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const res = await Logout();

    if (!res.status) {
      console.error(!res.message);
    }

    router.push("/");
  };

  const Overlay = () => (
    <div
      className={`fixed inset-0 bg-black/40 z-30 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setIsOpen(false)}
      aria-label="Tutup sidebar"
    />
  );

  const navItems = [
    { href: "/dashboard", icon: <Home size={22} />, label: "Dashboard" },
    {
      href: "/dashboard/documents",
      icon: <FileText size={22} />,
      label: "Arsip Dokumen",
    },
    {
      href: "/dashboard/security",
      icon: <Shield size={22} />,
      label: "Keamanan",
    },
    {
      href: "/dashboard/report",
      icon: <FileText size={22} />,
      label: "Pelaporan Arsip",
    },
    {
      href: "/dashboard/settings",
      icon: <Settings size={22} />,
      label: "Pengaturan",
    },
  ];

  return (
    <>
      {/* Overlay mobile */}
      <Overlay />

      {/* Tombol toggle mobile: TENGAH BAWAH */}
      <button
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-4 rounded-full bg-yellow-500 text-black shadow-lg active:scale-95 transition"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        style={{ touchAction: "manipulation" }}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Sidebar: MOBILE muncul dari KANAN -> KIRI */}
      <aside
        className={`fixed lg:static top-0 right-0 lg:left-0 min-h-screen w-72 bg-zinc-950 transition-transform duration-300 z-40 flex flex-col
        ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-24 border-b border-zinc-800">
          <Image src="/logo.png" alt="Logo" width={54} height={54} />
          <span className="ml-3 font-bold text-white text-lg tracking-tight">
            ARSIP POLRI
          </span>
        </div>

        {/* Menu */}
        <nav className="px-6 py-8 flex-1 flex flex-col space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition text-base font-medium active:scale-95 relative overflow-hidden ${
                  isActive
                    ? "bg-yellow-400 text-black"
                    : "text-gray-300 hover:text-black"
                }`}
                style={{ touchAction: "manipulation" }}
                onClick={() => setIsOpen(false)}
              >
                {!isActive && (
                  <span className="absolute left-[-60%] top-0 w-[220%] h-full bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 opacity-0 group-hover:opacity-60 group-hover:animate-shine pointer-events-none" />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  {item.icon} {item.label}
                </span>
              </Link>
            );
          })}

          {/* Logout di MOBILE → ikut di nav */}
          <button
            className="lg:hidden flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-600 hover:text-white transition text-base font-semibold active:scale-95 mt-auto"
            style={{ touchAction: "manipulation" }}
            aria-label="Logout"
          >
            <LogOut size={22} /> Logout
          </button>
        </nav>

        {/* Logout di DESKTOP → tetap di bawah */}
        <div className="hidden lg:block px-6 pb-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-300 hover:bg-red-600 hover:text-white transition text-base font-semibold active:scale-95"
            style={{ touchAction: "manipulation" }}
            aria-label="Logout"
          >
            <LogOut size={22} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
