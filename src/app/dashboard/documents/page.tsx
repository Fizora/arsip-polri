"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import {
  FileText,
  Shield,
  Star,
  Bookmark,
  BookmarkCheck,
  UserIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  Eye,
  X,
} from "lucide-react";

/**
 * Perubahan yang dilakukan:
 * - archiveData: hanya 1 dummy item.
 * - Modal: dipisah jadi dua overlay terpisah:
 *    - Auth modal (muncul pertama, berisi langkah autentikasi)
 *    - Detail modal (muncul hanya setelah autentikasi sukses).
 * - LEFT di detail modal: menampilkan history anggota & aset (foto/video/dokumen).
 * - RIGHT di detail modal: menampilkan informasi arsip (seperti sebelumnya).
 *
 * Catatan: validasi masih mock; tinggal hubungkan ke backend pada fungsi verifyCredentials,
 * handleRfidScanned, finalizeAccess untuk integrasi nyata.
 */

/* ============ Dummy data (sesuai perintah: cukup 1 item) ============ */
const archiveData = [
  {
    id: 1,
    title: "Laporan Intelijen 2025",
    type: "Super Rahasia",
    date: "2025-08-18",
    lastOpened: "2025-08-20 09:12",
    owner: "admin.polri",
    sensitive: true,
    priority: true,
    description:
      "Laporan intelijen tingkat tinggi terkait keamanan nasional. Akses terbatas — memerlukan 3FA.",
    views: 12,
    bookmarked: false,
    encryptionCode: "ENCR-9988",
    reporterKey: "RK-ALPHA-01",
    // demo history & aset — frontend-only, bisa diganti oleh backend nanti
    history: [
      { id: 1, name: "A. Susanto", role: "Operator", time: "2025-08-20 09:12" },
      { id: 2, name: "B. Rahma", role: "Supervisor", time: "2025-08-19 15:30" },
      { id: 3, name: "C. Wibowo", role: "Admin", time: "2025-08-18 21:00" },
    ],
    assets: [
      {
        id: "img-1",
        type: "image",
        label: "Foto Lokasi 1",
        src: "/demo/photo1.jpg",
      },
      {
        id: "vid-1",
        type: "video",
        label: "Rekaman 1",
        src: "/demo/video1.mp4",
      },
      {
        id: "doc-1",
        type: "document",
        label: "Lampiran.pdf",
        src: "/demo/file1.pdf",
      },
    ],
  },
];

// TypeScript: define types for archive, history, asset
interface ArchiveHistory {
  id: number;
  name: string;
  role: string;
  time: string;
}

interface ArchiveAsset {
  id: string;
  type: "image" | "video" | "document";
  label: string;
  src: string;
}

interface Archive {
  id: number;
  title: string;
  type: "Super Rahasia" | "Rahasia" | "Pembatasan" | "Umum";
  date: string;
  lastOpened: string;
  owner: string;
  sensitive: boolean;
  priority: boolean;
  description: string;
  views: number;
  bookmarked: boolean;
  encryptionCode: string;
  reporterKey: string;
  history: ArchiveHistory[];
  assets: ArchiveAsset[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const PAGE_SIZE = 9;

export default function ArchivePage() {
  // State hanya untuk UI, tidak ada logic backend
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selected, setSelected] = useState<Archive | null>(null);
  const [authStep, setAuthStep] = useState<string>("credentials");
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [encryptionInput, setEncryptionInput] = useState<string>("");
  const [reporterInput, setReporterInput] = useState<string>("");
  const [adminInput, setAdminInput] = useState<string>("");
  const [rfidBusy, setRfidBusy] = useState<boolean>(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const PAGE_SIZE = 9;
  const data = archiveData;
  const filtered = data.filter(
    (it) =>
      it.title.toLowerCase().includes(search.toLowerCase()) ||
      it.type.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Hanya UI, tidak ada logic autentikasi/validasi
  function openDetail(item: Archive): void {
    setSelected(item);
    setAuthStep("credentials");
    setIdentifier("");
    setPassword("");
    setInfo(null);
    setError(null);
    setEncryptionInput("");
    setReporterInput("");
    setAdminInput("");
    setRfidBusy(false);
  }
  function closeModal(): void {
    setSelected(null);
    setAuthStep("credentials");
    setInfo(null);
    setError(null);
    setIdentifier("");
    setPassword("");
    setEncryptionInput("");
    setReporterInput("");
    setAdminInput("");
  }

  const toggleBookmark = (id: number): void => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 text-gray-200 h-screen overflow-y-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-1 leading-tight">
              Arsip Data
            </h1>
            <p className="text-gray-400 text-base lg:text-lg">
              Cek dan tracking arsip digital kepolisian dengan mudah.
            </p>
          </div>
        </header>

        {/* Search & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <input
            type="text"
            className="w-full sm:w-64 px-4 py-2 rounded-sm border border-zinc-800 bg-zinc-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Cari arsip..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex gap-2 items-center">
            <button
              className="px-3 py-2 rounded-sm bg-zinc-800 text-gray-200 hover:bg-yellow-400 hover:text-black transition"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              &lt;
            </button>
            <span className="text-sm text-gray-400">
              Halaman {page} / {totalPages}
            </span>
            <button
              className="px-3 py-2 rounded-sm bg-zinc-800 text-gray-200 hover:bg-yellow-400 hover:text-black transition"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Cards */}
        <section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginated.map((item) => (
              <div
                key={item.id}
                onClick={() => openDetail(item)}
                className="group bg-zinc-900/80 border border-zinc-800 p-6 rounded-sm shadow-lg flex flex-col gap-2 transition-colors duration-300 cursor-pointer relative hover:border-yellow-400"
              >
                <div className="flex items-center gap-2 mb-2">
                  {item.sensitive ? (
                    <Shield size={24} className="text-yellow-400" />
                  ) : (
                    <FileText size={24} className="text-gray-400" />
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.type === "Super Rahasia"
                        ? "bg-red-500 text-white"
                        : item.type === "Rahasia"
                        ? "bg-yellow-400 text-black"
                        : item.type === "Pembatasan"
                        ? "bg-blue-400 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {item.type}
                  </span>

                  <button
                    className="ml-auto p-1 rounded hover:bg-yellow-400/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(item.id);
                    }}
                    aria-label={
                      item.bookmarked ? "Hapus bookmark" : "Bookmark arsip"
                    }
                  >
                    {item.bookmarked ? (
                      <BookmarkCheck size={18} className="text-yellow-400" />
                    ) : (
                      <Bookmark size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>

                <h2 className="text-lg font-bold text-white mb-1">
                  {item.title}
                </h2>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Star
                    size={14}
                    className={
                      item.priority ? "text-yellow-400" : "text-gray-600"
                    }
                  />
                  <span>{item.priority ? "Prioritas" : "Normal"}</span>
                </div>

                <div className="text-xs text-gray-400 mb-1">
                  Pengarsipan: {formatDate(item.date)}
                </div>
                <div className="text-xs text-gray-400 mb-1">
                  Terakhir dibuka: {formatDate(item.lastOpened)}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Eye size={16} className="text-yellow-400" />
                  <span className="text-xs text-gray-300">
                    {item.views} anggota telah mengakses
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Tap/klik kartu untuk lihat detail & autentikasi akses
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== AUTH MODAL (popup pertama) - tampil hanya saat selected && authStep !== 'success' ===== */}
        {selected && authStep !== "success" && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="bg-zinc-900 rounded-sm shadow-2xl p-6 w-full max-w-sm relative text-gray-200 border border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                <X />
              </button>

              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Autentikasi Arsip
                </h3>
                <div className="text-xs text-gray-400 mt-1">
                  {selected.type} • {selected.owner}
                </div>
              </div>

              {/* Authentication Steps (credentials / rfid / codes) */}
              <div>
                {authStep === "credentials" && (
                  <form className="space-y-3">
                    <label className="text-xs text-gray-300">NRP / Email</label>
                    <input
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      placeholder="NRP / Email"
                      autoComplete="username"
                    />
                    <label className="text-xs text-gray-300">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                      placeholder="•••••"
                      autoComplete="current-password"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        className="flex-1 px-3 py-1.5 rounded-md bg-yellow-500 text-black text-sm font-medium"
                        onClick={() => setAuthStep("rfid")}
                      >
                        Lanjutkan
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {authStep === "rfid" && (
                  <div className="space-y-3 text-center">
                    <div className="text-xs text-gray-300">
                      Langkah 2 — Scan RFID (scanner keyboard-emulating)
                    </div>
                    <div className="mx-auto w-60 h-45 rounded-md flex items-center justify-center border border-zinc-700 mb-1">
                      <svg
                        className={`w-8 h-8 text-gray-400`}
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path d="M12 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 18v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M4 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M16 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">
                        Silakan dekatkan kartu ke RFID reader terdaftar.
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2 justify-center">
                      <button
                        onClick={() => setAuthStep("credentials")}
                        className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200"
                      >
                        Kembali
                      </button>
                      <button
                        onClick={() => setAuthStep("codes")}
                        className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200"
                      >
                        Simulasi Scan RFID
                      </button>
                    </div>
                  </div>
                )}

                {authStep === "codes" && (
                  <div className="space-y-3">
                    {selected?.type === "Rahasia" && (
                      <>
                        <div className="text-xs text-gray-300">Masukkan kode enkripsi</div>
                        <input
                          value={encryptionInput}
                          onChange={(e) => setEncryptionInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          placeholder="ENCR-XXXX"
                        />
                      </>
                    )}

                    {selected?.type === "Super Rahasia" && (
                      <>
                        <div className="text-xs text-gray-300">Masukkan kode enkripsi</div>
                        <input
                          value={encryptionInput}
                          onChange={(e) => setEncryptionInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          placeholder="ENCR-XXXX"
                        />
                        <div className="text-xs text-gray-300">Masukkan kunci pelapor</div>
                        <input
                          value={reporterInput}
                          onChange={(e) => setReporterInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          placeholder="Kunci Pelapor"
                        />
                      </>
                    )}

                    {selected?.type === "Pembatasan" && (
                      <>
                        <div className="text-xs text-gray-300">Masukkan kode pembatasan/admin</div>
                        <input
                          value={adminInput}
                          onChange={(e) => setAdminInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          placeholder="Kode Pembatasan"
                        />
                      </>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setAuthStep("success")}
                        className="px-3 py-1.5 rounded-md bg-yellow-500 text-black text-sm"
                      >
                        Verifikasi & Akses
                      </button>
                      <button
                        onClick={() => setAuthStep("rfid")}
                        className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200"
                      >
                        Kembali
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Autentikasi aman — gantikan mock validation dengan API backend
                saat integrasi.
              </div>
            </div>
          </div>
        )}

        {/* ===== DETAIL MODAL (popup kedua) - tampil hanya setelah authStep === 'success' ===== */}
        {selected && authStep === "success" && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="bg-zinc-900 rounded-sm shadow-2xl p-4 sm:p-6 w-full max-w-3xl relative text-gray-200 border border-zinc-800 overflow-y-auto max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                <X />
              </button>

              {/* Header */}
              <div className="text-center mt-1 mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {selected.title}
                </h3>
                <div className="text-xs text-gray-400 mt-1">
                  {selected.type} • {selected.owner}
                </div>
              </div>

              {/* DETAIL: LEFT = HISTORY & ASSETS  | RIGHT = INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* LEFT: history & assets */}
                <div className="sm:col-span-1 flex flex-col gap-3 border-r border-zinc-800 pr-3">
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">
                      History Akses
                    </div>
                    <ul className="text-xs text-gray-300 divide-y divide-zinc-800">
                      {selected.history?.map((h) => (
                        <li key={h.id} className="py-2 flex items-start gap-2">
                          <UserIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
                          <div>
                            <div className="font-semibold text-sm text-gray-100">
                              {h.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {h.role} • {h.time}
                            </div>
                          </div>
                        </li>
                      )) || (
                        <li className="text-xs text-gray-400">
                          Tidak ada history
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-white mb-1">
                      Aset Terkait
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {selected.assets?.map((a) => (
                        <div
                          key={a.id}
                          className="text-xs text-gray-300 bg-zinc-800 rounded p-2 flex flex-col items-center"
                        >
                          <div className="mb-1">
                            {a.type === "image" ? (
                              <ImageIcon className="w-6 h-6 text-yellow-400" />
                            ) : a.type === "video" ? (
                              <VideoIcon className="w-6 h-6 text-yellow-400" />
                            ) : (
                              <FileIcon className="w-6 h-6 text-yellow-400" />
                            )}
                          </div>
                          <div className="text-center text-[11px]">
                            {a.label}
                          </div>
                        </div>
                      )) || (
                        <div className="text-xs text-gray-400">
                          Tidak ada aset
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: informasi arsip (detail) */}
                <div className="sm:col-span-2 flex flex-col gap-3">
                  <div className="text-sm font-semibold text-white">
                    Informasi Arsip
                  </div>
                  <div className="text-sm text-gray-100 bg-zinc-800 rounded-md p-3 shadow-inner">
                    {selected.description}
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    <div>
                      Tanggal:{" "}
                      <span className="text-gray-200 font-semibold">
                        {formatDate(selected.date)}
                      </span>
                    </div>
                    <div>
                      Terakhir dibuka:{" "}
                      <span className="text-gray-200 font-semibold">
                        {selected.lastOpened}
                      </span>
                    </div>
                    <div>
                      Jumlah views:{" "}
                      <span className="text-gray-200 font-semibold">
                        {selected.views}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        // placeholder: buka dokumen / viewer - integrasikan ke backend / viewer nanti
                        alert(
                          "Buka viewer (integrasikan backend/route viewer)."
                        );
                      }}
                      className="px-3 py-1.5 rounded-md bg-yellow-500 text-black text-sm"
                    >
                      Buka Dokumen
                    </button>

                    <button
                      onClick={() => {
                        // placeholder: download / request backend
                        alert("Download (integrasikan backend).");
                      }}
                      className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Tampilan detail — history & aset hanya muncul setelah
                autentikasi. Hubungkan fungsi autentikasi ke backend untuk
                produksi.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
