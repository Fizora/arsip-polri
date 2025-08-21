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
} from "lucide-react";

/**
 * Archive page with authentication popup:
 * - Modal shows minimal 2-step UI:
 *    Step 1: credentials (NRP/Email + password)
 *    Step 2: RFID scan (keyboard-emulating scanner only)
 * - After RFID: additional code inputs shown depending on document status:
 *    Super Rahasia -> ENCR + Reporter Key (3FA)
 *    Rahasia -> ENCR (2FA)
 *    Pembatasan -> Admin code
 *    Umum -> only RFID
 *
 * Notes:
 * - This is a demo: validation is mocked client-side. Replace with secure server calls.
 * - RFID step accepts only scanner input (no manual input).
 */

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
  },
  {
    id: 2,
    title: "Surat Tugas Operasi Aman",
    type: "Umum",
    date: "2025-08-15",
    lastOpened: "2025-08-19 15:30",
    owner: "user.arsip",
    sensitive: false,
    priority: false,
    description:
      "Surat tugas operasi pengamanan wilayah. Dapat diakses via RFID resmi.",
    views: 7,
    bookmarked: true,
  },
  {
    id: 3,
    title: "Data Personel Khusus",
    type: "Rahasia",
    date: "2025-08-10",
    lastOpened: "2025-08-18 21:00",
    owner: "supervisor",
    sensitive: true,
    priority: true,
    description:
      "Data personel khusus untuk operasi rahasia. Akses memerlukan RFID + kode enkripsi dari pelapor.",
    views: 5,
    bookmarked: false,
    encryptionCode: "ENCR-5566",
  },
  {
    id: 4,
    title: "Dokumen Rapat Strategi",
    type: "Pembatasan",
    date: "2025-07-22",
    lastOpened: "2025-08-01 11:00",
    owner: "kapolres",
    sensitive: false,
    priority: false,
    description:
      "Dokumen berlaku terbatas — memerlukan verifikasi admin khusus.",
    views: 3,
    bookmarked: false,
    adminCode: "ADM-2025-01",
  },
  {
    id: 5,
    title: "Laporan Keuangan Internal",
    type: "Umum",
    date: "2025-06-05",
    lastOpened: "2025-06-10 08:30",
    owner: "bendahara",
    sensitive: false,
    priority: false,
    description: "Laporan keuangan unit. Akses: RFID valid.",
    views: 9,
    bookmarked: false,
  },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const PAGE_SIZE = 9;

export default function ArchivePage() {
  const [data, setData] = useState(archiveData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // authentication modal states
  const [authStep, setAuthStep] = useState("credentials"); // 'credentials' | 'rfid' | 'codes' | 'success'
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);

  // credentials
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // scanner buffer (for RFID)
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const [rfidBusy, setRfidBusy] = useState(false);

  // post-RFID inputs (codes)
  const [encryptionInput, setEncryptionInput] = useState("");
  const [reporterInput, setReporterInput] = useState("");
  const [adminInput, setAdminInput] = useState("");

  // search & pagination
  const filtered = data.filter(
    (it) =>
      it.title.toLowerCase().includes(search.toLowerCase()) ||
      it.type.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // open card -> reset auth UI and open modal
  function openDetail(item) {
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

  // credentials verification (mock)
  async function verifyCredentials(e) {
    e?.preventDefault();
    setError(null);
    if (!identifier.trim() || !password.trim()) {
      setError("NRP/Email dan Password wajib diisi.");
      return;
    }
    setLoading(true);
    setInfo("Memeriksa kredensial...");
    await new Promise((r) => setTimeout(r, 600));
    // demo: accept any non-empty credentials
    setLoading(false);
    setInfo(null);
    // next: go to RFID step if RFID is required by doc type
    setAuthStep("rfid");
  }

  // global keydown listener only when authStep === 'rfid'
  useEffect(() => {
    if (authStep !== "rfid") return;
    // only if modal open and selected exists
    if (!selected) return;
    setError(null);
    setInfo("Menunggu scan RFID... (scanner keyboard-emulating)");
    function resetBuffer() {
      bufferRef.current = "";
      lastKeyTimeRef.current = 0;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    function onKeyDown(e) {
      if (rfidBusy) return;
      const now = Date.now();
      if (lastKeyTimeRef.current && now - lastKeyTimeRef.current > 1000) {
        bufferRef.current = ""; // slow typing -> reset
      }
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const code = bufferRef.current.trim();
        bufferRef.current = "";
        lastKeyTimeRef.current = 0;
        e.preventDefault();
        if (code) handleRfidScanned(code);
        else setError("Tidak ada data yang ter-scan. Coba lagi.");
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
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

  async function handleRfidScanned(code) {
    setRfidBusy(true);
    setError(null);
    setInfo("Memverifikasi RFID...");
    await new Promise((r) => setTimeout(r, 600));
    // demo validation rule
    if (code && code.length >= 3 && code !== "000") {
      setInfo("RFID terdeteksi — lanjut verifikasi selanjutnya.");
      setRfidBusy(false);
      // decide next step depending on selected.type
      if (!selected) return;
      if (selected.type === "Umum") {
        setAuthStep("success");
        finalizeSuccess();
      } else if (selected.type === "Rahasia") {
        setAuthStep("codes");
      } else if (selected.type === "Super Rahasia") {
        setAuthStep("codes");
      } else if (selected.type === "Pembatasan") {
        setAuthStep("codes");
      } else {
        setAuthStep("success");
        finalizeSuccess();
      }
    } else {
      setRfidBusy(false);
      setError("RFID tidak valid. Silakan scan ulang.");
      setInfo("Menunggu scan RFID...");
    }
  }

  // finalize: validate codes (if any) then grant access
  async function finalizeAccess() {
    setError(null);
    setLoading(true);
    setInfo("Memverifikasi kode...");
    await new Promise((r) => setTimeout(r, 600));

    if (!selected) return;
    if (selected.type === "Rahasia") {
      if ((encryptionInput || "").trim() !== (selected.encryptionCode || "")) {
        setError("Kode enkripsi salah.");
        setLoading(false);
        setInfo(null);
        return;
      }
    } else if (selected.type === "Super Rahasia") {
      if ((encryptionInput || "").trim() !== (selected.encryptionCode || "")) {
        setError("Kode enkripsi salah.");
        setLoading(false);
        setInfo(null);
        return;
      }
      if ((reporterInput || "").trim() !== (selected.reporterKey || "")) {
        setError("Kunci pelapor salah.");
        setLoading(false);
        setInfo(null);
        return;
      }
    } else if (selected.type === "Pembatasan") {
      if ((adminInput || "").trim() !== (selected.adminCode || "")) {
        setError("Kode pembatasan/admin salah.");
        setLoading(false);
        setInfo(null);
        return;
      }
    }

    // success: update views, show success, close after short delay
    setData((prev) =>
      prev.map((it) =>
        it.id === selected.id ? { ...it, views: (it.views || 0) + 1 } : it
      )
    );
    setLoading(false);
    setInfo(null);
    setAuthStep("success");
    setTimeout(() => {
      // close modal automatically
      setSelected(null);
      setAuthStep("credentials");
      setIdentifier("");
      setPassword("");
      setEncryptionInput("");
      setReporterInput("");
      setAdminInput("");
    }, 900);
  }

  function finalizeSuccess() {
    // for 'Umum' path we already incremented views in handleRfidScanned? we do here for safety
    if (!selected) return;
    setData((prev) =>
      prev.map((it) =>
        it.id === selected.id ? { ...it, views: (it.views || 0) + 1 } : it
      )
    );
    setTimeout(() => {
      // auto close
      setSelected(null);
      setAuthStep("credentials");
    }, 800);
  }

  // close modal on overlay click
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
  }

  const toggleBookmark = (id) => {
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
        {/* Header (keep consistent with your requested header earlier) */}
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
            className="w-full sm:w-64 px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Cari arsip..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div className="flex gap-2 items-center">
            <button
              className="px-3 py-2 rounded-lg bg-zinc-800 text-gray-200 hover:bg-yellow-400 hover:text-black transition"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              &lt;
            </button>
            <span className="text-sm text-gray-400">
              Halaman {page} / {totalPages}
            </span>
            <button
              className="px-3 py-2 rounded-lg bg-zinc-800 text-gray-200 hover:bg-yellow-400 hover:text-black transition"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Cards (tap/klik kartu untuk membuka autentikasi) */}
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

                <h2 className="text-lg font-bold text-white mb-1">{item.title}</h2>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Star size={14} className={item.priority ? "text-yellow-400" : "text-gray-600"} />
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
                  <span className="text-xs text-gray-300">{item.views} anggota telah mengakses</span>
                </div>

                <div className="mt-3 text-xs text-gray-400">Tap/klik kartu untuk lihat detail & autentikasi akses</div>
              </div>
            ))}
          </div>
        </section>

        {/* Modal: minimal-auth style inside popup */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={closeModal} // klik overlay menutup modal
            role="dialog"
            aria-modal="true"
          >
            <div
              className="bg-zinc-900 rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-md sm:max-w-2xl lg:max-w-4xl relative text-gray-200 border border-zinc-800 overflow-y-auto max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo tengah */}
              <div className="flex justify-center -mt-6">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-full drop-shadow-md"
                />
              </div>

              {/* Header short */}
              <div className="text-center mt-3 mb-4">
                <h3 className="text-lg font-semibold text-white">{selected.title}</h3>
                <div className="text-xs text-gray-400 mt-1">{selected.type} • {selected.owner}</div>
              </div>

              {/* modal content area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* LEFT: doc info */}
                <div className="sm:col-span-1 flex flex-col gap-3 border-r border-zinc-800 pr-3">
                  <div className="text-sm text-gray-300">Tanggal</div>
                  <div className="text-sm text-gray-200 font-semibold">{formatDate(selected.date)}</div>

                  <div className="mt-2 text-sm text-gray-300">Status Akses</div>
                  <div className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold ${selected.type === "Super Rahasia" ? "bg-red-500 text-white" : selected.type === "Rahasia" ? "bg-yellow-400 text-black" : selected.type === "Pembatasan" ? "bg-blue-400 text-white" : "bg-green-400 text-black"}`}>
                    {selected.type}
                  </div>

                  <div className="mt-3 text-xs text-gray-400">{selected.description}</div>
                </div>

                {/* CENTER: description / info */}
                <div className="sm:col-span-1 flex flex-col gap-3">
                  <div className="text-sm font-semibold text-white">Informasi Arsip</div>
                  <div className="text-sm text-gray-100 bg-zinc-800 rounded-md p-3 shadow-inner">{selected.description}</div>
                </div>

                {/* RIGHT: Authentication minimal UI */}
                <div className="sm:col-span-1 flex flex-col gap-3">
                  <div className="text-sm font-semibold text-white flex items-center justify-between">
                    <span>Autentikasi</span>
                    <span className="text-xs text-gray-400">Step {authStep === "credentials" ? 1 : authStep === "rfid" ? 2 : authStep === "codes" ? 3 : 4}</span>
                  </div>

                  {/* CREDENTIALS */}
                  {authStep === "credentials" && (
                    <form onSubmit={verifyCredentials} className="space-y-2">
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
                      {error && <div className="text-xs text-red-400">{error}</div>}
                      {info && <div className="text-xs text-gray-400">{info}</div>}
                      <div className="flex gap-2 mt-2">
                        <button type="submit" disabled={loading} className="flex-1 px-3 py-1.5 rounded-md bg-yellow-500 text-black text-sm font-medium disabled:opacity-60">
                          {loading ? "Memeriksa..." : "Lanjutkan"}
                        </button>
                        <button type="button" onClick={closeModal} className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200">Batal</button>
                      </div>
                    </form>
                  )}

                  {/* RFID step (scan-only) */}
                  {authStep === "rfid" && (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-300">Langkah 2 — Scan RFID (hanya scan)</div>
                      <div className="mx-auto w-20 h-20 rounded-md flex items-center justify-center border border-zinc-700 mb-1">
                        <svg className={`w-8 h-8 ${rfidBusy ? "animate-pulse text-yellow-400" : "text-gray-400"}`} viewBox="0 0 24 24" fill="none">
                          <path d="M12 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M12 18v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M4 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M16 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="text-xs text-gray-400">{info ?? "Silakan dekatkan kartu ke RFID reader terdaftar. Scanner harus keyboard-emulating."}</div>
                      {error && <div className="text-xs text-red-400">{error}</div>}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { setAuthStep("credentials"); setError(null); setInfo(null); }} className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200">Kembali</button>
                        <button onClick={() => { setError(null); setInfo("Menunggu scan RFID..."); window.focus(); }} className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200">Siap</button>
                      </div>
                    </div>
                  )}

                  {/* CODES (after RFID): shown for Rahasia / Super Rahasia / Pembatasan */}
                  {authStep === "codes" && (
                    <div className="space-y-2">
                      {selected.type === "Rahasia" && (
                        <>
                          <div className="text-xs text-gray-300">Masukkan kode enkripsi (diberikan pelapor)</div>
                          <input
                            value={encryptionInput}
                            onChange={(e) => setEncryptionInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            placeholder="ENCR-XXXX"
                          />
                        </>
                      )}

                      {selected.type === "Super Rahasia" && (
                        <>
                          <div className="text-xs text-gray-300">Masukkan kode enkripsi</div>
                          <input
                            value={encryptionInput}
                            onChange={(e) => setEncryptionInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            placeholder="ENCR-XXXX"
                          />
                          <div className="text-xs text-gray-300">Masukkan kunci pelapor (diberikan pelapor)</div>
                          <input
                            value={reporterInput}
                            onChange={(e) => setReporterInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-md bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            placeholder="Kunci Pelapor"
                          />
                        </>
                      )}

                      {selected.type === "Pembatasan" && (
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

                      {error && <div className="text-xs text-red-400">{error}</div>}
                      <div className="flex gap-2 mt-2">
                        <button onClick={finalizeAccess} disabled={loading} className="px-3 py-1.5 rounded-md bg-yellow-500 text-black text-sm">{loading ? "Memeriksa..." : "Verifikasi & Akses"}</button>
                        <button onClick={() => { setAuthStep("rfid"); setError(null); }} className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200">Kembali</button>
                      </div>
                    </div>
                  )}

                  {/* SUCCESS (short confirmation) */}
                  {authStep === "success" && (
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none">
                          <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-white">Akses Diterima</div>
                      <div className="text-xs text-gray-300">Autentikasi berhasil — menampilkan dokumen (demo)</div>
                      <div className="flex gap-2 justify-center mt-2">
                        <button onClick={() => { /* TODO: open document viewer */ closeModal(); }} className="px-3 py-1.5 rounded-md bg-yellow-500 text-black text-sm">Lanjut</button>
                        <button onClick={closeModal} className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200">Tutup</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* small footer hint */}
              <div className="mt-4 text-xs text-gray-500 text-center">Autentikasi aman — ganti mock validation dengan API server pada implementasi nyata.</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
