"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { FileText, Shield, UserIcon, FileIcon } from "lucide-react";
import Header from "@/components/Header";

export default function ReportPage() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 text-gray-200">
        <Header />

        {/* Dummy konten laporan */}
        <section>
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-sm shadow-lg">
            <h2 className="text-xl font-bold text-white mb-2">
              Daftar Laporan Arsip
            </h2>
            <p className="text-gray-400 text-sm">
              (Belum ada laporan baru, silakan gunakan tombol{" "}
              <span className="font-semibold text-yellow-400">
                + Lapor Arsip
              </span>{" "}
              untuk menambahkan)
            </p>
          </div>
        </section>

        {/* Popup Form */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-2">
            <div className="bg-zinc-900 rounded-sm shadow-2xl p-6 sm:p-8 w-full max-w-6xl relative animate-fadeIn text-gray-200 border border-zinc-800 flex flex-col">
              {/* Close Button */}
              <button
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-red-500 text-2xl sm:text-3xl font-bold"
                onClick={() => setShowPopup(false)}
                aria-label="Tutup"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                Form Laporan Arsip Baru
              </h2>

              <form className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Kiri */}
                <div className="flex flex-col gap-4 border-r border-zinc-800 pr-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-300">
                      Judul Arsip
                    </span>
                    <input
                      type="text"
                      placeholder="Contoh: Laporan Operasi Khusus"
                      className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-300">
                      Jenis Arsip
                    </span>
                    <select className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white">
                      <option value="Biasa">Biasa</option>
                      <option value="Rahasia">Rahasia</option>
                      <option value="Super Rahasia">Super Rahasia</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-300">
                      Prioritas
                    </span>
                    <select className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white">
                      <option value="Normal">Normal</option>
                      <option value="Tinggi">Tinggi</option>
                    </select>
                  </label>
                </div>

                {/* Tengah */}
                <div className="flex flex-col gap-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-300">
                      Deskripsi Arsip
                    </span>
                    <textarea
                      rows={8}
                      placeholder="Tuliskan deskripsi laporan secara detail..."
                      className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-300">
                      Catatan Tambahan
                    </span>
                    <textarea
                      rows={4}
                      placeholder="Tambahkan catatan tambahan jika diperlukan..."
                      className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    />
                  </label>
                </div>

                {/* Kanan */}
                <div className="flex flex-col gap-4 border-l border-zinc-800 pl-4">
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-300">
                      Upload Dokumen
                    </span>
                    <input
                      type="file"
                      className="text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-300">
                      Upload Foto
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-300">
                      Upload Video
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      className="text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                    />
                  </label>
                </div>
              </form>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-gray-300 hover:bg-zinc-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                >
                  Simpan Laporan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
