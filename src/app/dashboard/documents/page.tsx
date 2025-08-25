"use client";
import Sidebar from "@/components/Sidebar";
import { useEffect, useRef, useState } from "react";
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
      "Arsip rahasia negara,seorang naufal blunder ketika membeli Mie Gacoan Dinoyo tapi malah di kirim ke Gacoan Suhat",
    views: 12,
    bookmarked: false,
    encryptionCode: "ENCR-9988",
    reporterKey: "RK-ALPHA-01",
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
    adminCode: "ADMIN-1234",
  },
];

type ArchiveHistory = {
  id: number;
  name: string;
  role: string;
  time: string;
};

type ArchiveAsset = {
  id: string;
  type: "image" | "video" | "document";
  label: string;
  src: string;
};

type Archive = {
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
  encryptionCode?: string;
  reporterKey?: string;
  adminCode?: string;
  history?: ArchiveHistory[];
  assets?: ArchiveAsset[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const PAGE_SIZE = 9;

export default function ArchivePage() {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selected, setSelected] = useState<Archive | null>(null);
  // Perbaikan: data dan setData agar toggleBookmark dan update views tidak error
  const [data, setData] = useState<Archive[]>(archiveData);

  // authentication modal states
  const [authStep, setAuthStep] = useState<
    "credentials" | "rfid" | "codes" | "rfidSuccess" | "success"
  >("credentials");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // credentials
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // RFID scanner state
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);
  const [rfidBusy, setRfidBusy] = useState<boolean>(false);

  // post-RFID inputs (codes)
  const [encryptionInput, setEncryptionInput] = useState<string>("");
  const [reporterInput, setReporterInput] = useState<string>("");
  const [adminInput, setAdminInput] = useState<string>("");

  // search & pagination
  const filtered = data.filter(
    (it) =>
      it.title.toLowerCase().includes(search.toLowerCase()) ||
      it.type.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // open card -> reset auth UI and open modal
  function openDetail(item: Archive) {
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

  function closeModal() {
    setSelected(null);
    setAuthStep("credentials");
    setInfo(null);
    setError(null);
    setIdentifier("");
    setPassword("");
    setEncryptionInput("");
    setReporterInput("");
    setAdminInput("");
    // reset scanner buffer
    bufferRef.current = "";
    lastKeyTimeRef.current = 0;
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setRfidBusy(false);
  }

  // credentials verification (mock UI-only)
  function verifyCredentials(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!identifier.trim() || !password.trim()) {
      setError("NRP/Email dan Password wajib diisi.");
      return;
    }
    setInfo("Memeriksa kredensial...");
    setTimeout(() => {
      setInfo(null);
      setAuthStep("rfid");
    }, 600);
  }

  // verify RFID code (mock) — now shows check UI (rfidSuccess) before opening detail
  async function verifyRfidCode(code: string) {
    setRfidBusy(true);
    setError(null);
    setInfo("Memverifikasi RFID...");
    await new Promise((r) => setTimeout(r, 700));
    // demo validation: length >= 4 and not exactly '202020'
    if (code && code.length >= 4 && code !== "202020") {
      setRfidBusy(false);
      setInfo("RFID terdeteksi — verifikasi berhasil.");
      // show the green check UI first (matches MinimalLogin2FA)
      setAuthStep("rfidSuccess");
      // then after a short delay switch to success (detail modal)
      setTimeout(() => {
        setAuthStep("success");
      }, 800);
    } else {
      setRfidBusy(false);
      setError("RFID tidak valid. Silakan scan ulang.");
      setInfo("Menunggu scan RFID...");
    }
  }

  // finalize: validate codes (if any) then grant access
  async function finalizeAccess() {
    setError(null);
    setInfo("Memverifikasi kode...");
    // simulate server call
    await new Promise((r) => setTimeout(r, 600));

    if (!selected) return;
    if (selected.type === "Rahasia") {
      if ((encryptionInput || "").trim() !== (selected.encryptionCode || "")) {
        setError("Kode enkripsi salah.");
        setInfo(null);
        return;
      }
    } else if (selected.type === "Super Rahasia") {
      if ((encryptionInput || "").trim() !== (selected.encryptionCode || "")) {
        setError("Kode enkripsi salah.");
        setInfo(null);
        return;
      }
      if ((reporterInput || "").trim() !== (selected.reporterKey || "")) {
        setError("Kunci pelapor salah.");
        setInfo(null);
        return;
      }
    } else if (selected.type === "Pembatasan") {
      if ((adminInput || "").trim() !== (selected.adminCode || "")) {
        setError("Kode pembatasan/admin salah.");
        setInfo(null);
        return;
      }
    }

    // success: increment views and show check UI, then show detail
    setData((prev) =>
      prev.map((it) =>
        it.id === selected.id ? { ...it, views: (it.views || 0) + 1 } : it
      )
    );
    setInfo(null);
    setAuthStep("rfidSuccess");
    setTimeout(() => {
      setAuthStep("success");
    }, 800);
  }

  function finalizeSuccess() {
    // for 'Umum' path we increment views and show check UI before detail
    if (!selected) return;
    setData((prev) =>
      prev.map((it) =>
        it.id === selected.id ? { ...it, views: (it.views || 0) + 1 } : it
      )
    );
    setAuthStep("rfidSuccess");
    setTimeout(() => {
      setAuthStep("success");
    }, 600);
  }

  // --- global keydown listener only when authStep === 'rfid' ---
  useEffect(() => {
    if (authStep !== "rfid") return;
    if (!selected) return;
    setError(null);
    setInfo("Menunggu scan RFID... (scanner keyboard-emulating)");

    function resetBuffer() {
      bufferRef.current = "";
      lastKeyTimeRef.current = 0;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (rfidBusy) return;
      const now = Date.now();
      if (lastKeyTimeRef.current && now - lastKeyTimeRef.current > 1000) {
        bufferRef.current = "";
      }
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const code = bufferRef.current.trim();
        bufferRef.current = "";
        lastKeyTimeRef.current = 0;
        if (code) {
          verifyRfidCode(code);
        } else {
          setError("Tidak ada data yang ter-scan. Coba lagi.");
        }
        e.preventDefault();
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        bufferRef.current = "";
        lastKeyTimeRef.current = 0;
      }, 1200);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      resetBuffer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStep, rfidBusy, selected]);

  const toggleBookmark = (id: number) => {
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
            {/* auth modal styled like MinimalLogin2FA */}
            <div
              className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-xl relative text-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo besar di tengah */}
              <div className="flex justify-center -mt-6 mb-4">
                <img
                  src="/logo.png"
                  alt="Logo Polri"
                  className="w-36 h-36 sm:w-48 sm:h-48 object-cover rounded-full drop-shadow-md"
                />
              </div>

              {/* close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                aria-label="Tutup"
              >
                <X />
              </button>

              {/* minimal header */}
              <div className="text-center mt-2 mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                  Sistem Arsip Digital
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Akses internal personel — autentikasi 2 langkah
                </p>
                <div className="text-xs text-gray-400 mt-2">
                  {selected.type} • {selected.owner}
                </div>
              </div>

              {/* content area (credentials / rfid / rfidSuccess / codes) */}
              <div>
                {authStep === "credentials" && (
                  <form onSubmit={verifyCredentials} className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-300 block mb-1">
                        NRP / Email
                      </label>
                      <input
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full px-3 py-2 rounded-md bg-zinc-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        placeholder="Masukkan NRP / Email"
                        autoComplete="username"
                        aria-label="nrp-email"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-300 block mb-1">
                        Password
                      </label>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        className="w-full px-3 py-2 rounded-md bg-zinc-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        placeholder="••••••"
                        autoComplete="current-password"
                        aria-label="password"
                      />
                    </div>

                    {error && (
                      <div className="text-xs text-red-400">{error}</div>
                    )}
                    {info && (
                      <div className="text-xs text-gray-400">{info}</div>
                    )}

                    <div className="flex gap-2 items-center mt-2">
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium"
                      >
                        Lanjutkan
                      </button>

                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-3 py-2 rounded-md bg-zinc-800 text-xs text-gray-200 hover:bg-zinc-700"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {authStep === "rfid" && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white">
                        Verifikasi 2-Langkah
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Langkah 2 — Scan RFID (hanya scan)
                      </div>
                    </div>

                    <div className="mt-3 p-4 rounded-lg bg-zinc-800 border border-zinc-700 text-center">
                      <div className="text-sm text-gray-200 mb-3">
                        {rfidBusy
                          ? "Memverifikasi..."
                          : info ?? "Silakan dekatkan kartu ke RFID reader"}
                      </div>

                      <div className="mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-md flex items-center justify-center border border-zinc-700 mb-3">
                        <svg
                          className={`w-10 h-10 ${
                            rfidBusy
                              ? "animate-pulse text-yellow-400"
                              : "text-gray-400"
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2v4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12 18v4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M4 12h4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M16 12h4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      {error && (
                        <div className="text-xs text-red-400 mb-2">{error}</div>
                      )}

                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setAuthStep("credentials");
                            setError(null);
                            setInfo(null);
                          }}
                          className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200 hover:bg-zinc-700"
                        >
                          Kembali
                        </button>

                        <button
                          onClick={() => {
                            setError(null);
                            setInfo("Menunggu scan RFID...");
                            bufferRef.current = "";
                            lastKeyTimeRef.current = 0;
                            if (timeoutRef.current) {
                              window.clearTimeout(timeoutRef.current);
                              timeoutRef.current = null;
                            }
                            window.focus();
                          }}
                          className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200 hover:bg-zinc-700"
                        >
                          Siap
                        </button>

                        <button
                          onClick={() => {
                            // demo helper: manual test prompt for RFID code
                            const code = window.prompt(
                              "Masukkan kode RFID demo (untuk testing):"
                            );
                            if (code !== null) {
                              verifyRfidCode(code.trim());
                            }
                          }}
                          className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200 hover:bg-zinc-700"
                        >
                          Tes Manual
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Hanya pemindaian RFID dari reader terdaftar yang diterima
                      — tidak ada input manual.
                    </div>
                  </div>
                )}

                {/* RFID success: show green check (same as login example) */}
                {authStep === "rfidSuccess" && (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-green-400"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Verifikasi Berhasil
                    </div>
                    <div className="text-xs text-gray-300">
                      RFID terdeteksi — menampilkan detail arsip.
                    </div>

                    <div className="flex gap-2 justify-center mt-2">
                      <button
                        onClick={() => setAuthStep("success")}
                        className="px-3 py-1.5 rounded-md bg-yellow-500 text-black text-sm font-medium"
                      >
                        Lanjut
                      </button>
                      <button
                        onClick={() => {
                          // if user wants to re-scan, return to rfid step
                          setAuthStep("rfid");
                          setError(null);
                          setInfo(null);
                        }}
                        className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200"
                      >
                        Scan Ulang
                      </button>
                    </div>
                  </div>
                )}

                {authStep === "codes" && (
                  <div className="space-y-3">
                    {selected?.type === "Rahasia" && (
                      <>
                        <div className="text-xs text-gray-300">
                          Masukkan kode enkripsi
                        </div>
                        <input
                          value={encryptionInput}
                          onChange={(e) => setEncryptionInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-zinc-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          placeholder="ENCR-XXXX"
                        />
                      </>
                    )}

                    {selected?.type === "Super Rahasia" && (
                      <>
                        <div className="text-xs text-gray-300">
                          Masukkan kode enkripsi
                        </div>
                        <input
                          value={encryptionInput}
                          onChange={(e) => setEncryptionInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-zinc-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          placeholder="ENCR-XXXX"
                        />
                        <div className="text-xs text-gray-300">
                          Masukkan kunci pelapor
                        </div>
                        <input
                          value={reporterInput}
                          onChange={(e) => setReporterInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-zinc-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          placeholder="Kunci Pelapor"
                        />
                      </>
                    )}

                    {selected?.type === "Pembatasan" && (
                      <>
                        <div className="text-xs text-gray-300">
                          Masukkan kode pembatasan/admin
                        </div>
                        <input
                          value={adminInput}
                          onChange={(e) => setAdminInput(e.target.value)}
                          className="w-full px-3 py-2 rounded-md bg-zinc-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                          placeholder="Kode Pembatasan"
                        />
                      </>
                    )}

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={finalizeAccess}
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
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 w-full"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="bg-zinc-900 rounded-sm shadow-2xl p-4 sm:p-6 w-full max-w-7xl relative text-gray-200 border border-zinc-800 overflow-y-auto max-h-[92vh]"
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
                ARSIP Polri — Semua data dan akses dalam pengawasan penuh.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
