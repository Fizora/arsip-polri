"use client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Shield,
  UserIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  Eye,
  Bookmark,
  BookmarkCheck,
  X,
} from "lucide-react";

/**
 * ReportPage (responsive/mobile-friendly)
 * - Dummy data: 1 report
 * - Mobile-first adjustments:
 *   * Modals are full-screen on small devices (scrollable).
 *   * Cards stack nicely and have larger touch targets.
 *   * Detail modal stacks left/right into one column on small screens.
 *
 * Integrasikan ke backend dengan mengganti state-manipulation pada:
 * - handleCreateReport -> POST /api/reports
 * - handleVerify -> PUT /api/reports/:id/verify
 */

type AssetType = "image" | "video" | "document";
type ReportStatus = "pending" | "verified";

type Asset = {
  id: string;
  type: AssetType;
  name: string;
  url?: string;
};

type HistoryEntry = {
  id: string;
  actor: string;
  action: "reported" | "verified";
  note?: string;
  at: string;
};

type Report = {
  id: number;
  title: string;
  classification: string;
  priority: "Normal" | "Tinggi";
  description: string;
  reporter: { name: string; unit?: string; nrp?: string };
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string;
  history: HistoryEntry[];
  assets: Asset[];
  bookmarked?: boolean;
};

const nowIso = () => new Date().toISOString();

const initialReports: Report[] = [
  {
    id: 1,
    title: "Laporan Intelijen 2025",
    classification: "Super Rahasia",
    priority: "Tinggi",
    description:
      "Laporan intelijen tingkat tinggi terkait keamanan nasional. Butuh verifikasi admin sebelum diarsipkan.",
    reporter: { name: "A. Susanto", unit: "Satintel", nrp: "19876" },
    status: "pending",
    createdAt: nowIso(),
    history: [
      {
        id: "h-1",
        actor: "A. Susanto",
        action: "reported",
        note: "Laporan awal dibuat",
        at: nowIso(),
      },
    ],
    assets: [
      {
        id: "a-1",
        type: "image",
        name: "Foto Lokasi 1",
        url: "/demo/photo1.jpg",
      },
      {
        id: "a-2",
        type: "document",
        name: "Lampiran.pdf",
        url: "/demo/file1.pdf",
      },
    ],
    bookmarked: false,
  },
];

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [filterStatus, setFilterStatus] = useState<"all" | ReportStatus>("all");
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Form state for new report
  const [formTitle, setFormTitle] = useState("");
  const [formClassification, setFormClassification] = useState("Biasa");
  const [formPriority, setFormPriority] = useState<"Normal" | "Tinggi">(
    "Normal"
  );
  const [formDescription, setFormDescription] = useState("");
  const [formReporterName, setFormReporterName] = useState("");
  const [formReporterUnit, setFormReporterUnit] = useState("");
  const [formFiles, setFormFiles] = useState<File[]>([]);

  // Detail modal
  const [selected, setSelected] = useState<Report | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = reports.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.reporter.name.toLowerCase().includes(q)
    );
  });

  function openDetail(report: Report) {
    setSelected(report);
  }

  function closeDetail() {
    setSelected(null);
  }

  function toggleBookmark(id: number) {
    setReports((prev) =>
      prev.map((p) => (p.id === id ? { ...p, bookmarked: !p.bookmarked } : p))
    );
  }

  function handleCreateReport(e?: React.FormEvent) {
    e?.preventDefault();
    if (!formTitle.trim() || !formReporterName.trim()) {
      alert("Judul dan nama pelapor wajib diisi.");
      return;
    }

    const assets: Asset[] = formFiles.map((f, idx) => {
      const type: AssetType = f.type.startsWith("image")
        ? "image"
        : f.type.startsWith("video")
        ? "video"
        : "document";
      const url = URL.createObjectURL(f);
      return { id: `new-${Date.now()}-${idx}`, type, name: f.name, url };
    });

    const id = Math.max(0, ...reports.map((r) => r.id)) + 1;
    const createdAt = new Date().toISOString();
    const newReport: Report = {
      id,
      title: formTitle,
      classification: formClassification,
      priority: formPriority,
      description: formDescription,
      reporter: { name: formReporterName, unit: formReporterUnit || undefined },
      status: "pending",
      createdAt,
      history: [
        {
          id: `h-${id}-1`,
          actor: formReporterName,
          action: "reported",
          note: "Laporan dibuat",
          at: createdAt,
        },
      ],
      assets,
      bookmarked: false,
    };

    setReports((prev) => [newReport, ...prev]);
    setFormTitle("");
    setFormClassification("Biasa");
    setFormPriority("Normal");
    setFormDescription("");
    setFormReporterName("");
    setFormReporterUnit("");
    setFormFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowPopup(false);
  }

  function handleVerify(reportId: number) {
    const verifiedAt = new Date().toISOString();
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: "verified",
              updatedAt: verifiedAt,
              history: [
                ...r.history,
                {
                  id: `h-${reportId}-${r.history.length + 1}`,
                  actor: "Admin",
                  action: "verified",
                  note: "Diverifikasi admin",
                  at: verifiedAt,
                },
              ],
            }
          : r
      )
    );

    if (selected && selected.id === reportId) {
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              status: "verified",
              updatedAt: verifiedAt,
              history: [
                ...prev.history,
                {
                  id: `h-${reportId}-${prev.history.length + 1}`,
                  actor: "Admin",
                  action: "verified",
                  note: "Diverifikasi admin",
                  at: verifiedAt,
                },
              ],
            }
          : prev
      );
    }
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setFormFiles(Array.from(files));
  }

  useEffect(() => {
    return () => {
      reports.forEach((r) =>
        r.assets.forEach((a) => {
          if (a.url && a.url.startsWith("blob:")) URL.revokeObjectURL(a.url);
        })
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-10 text-gray-200">
        <Header />

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-lg">
            <div className="text-xs text-gray-300">Total Laporan</div>
            <div className="text-2xl font-bold">{reports.length}</div>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-lg">
            <div className="text-xs text-gray-300">Pending</div>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.status === "pending").length}
            </div>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-lg">
            <div className="text-xs text-gray-300">Verified</div>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.status === "verified").length}
            </div>
          </div>
        </section>

        <section>
          <div className="grid gap-3">
            {filtered.length === 0 ? (
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded text-gray-400">
                Tidak ada laporan sesuai filter.
              </div>
            ) : (
              filtered.map((r) => (
                <article
                  key={r.id}
                  onClick={() => openDetail(r)}
                  className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-lg flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between hover:border-yellow-400 cursor-pointer"
                  role="button"
                >
                  <div className="flex items-start gap-3 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <FileText className="text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {r.title}
                      </h3>
                      <div className="text-xs text-gray-400 mt-0.5 truncate">
                        {r.classification} • {r.priority} • Dilaporkan oleh{" "}
                        {r.reporter.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Created: {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <div
                      className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        r.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {r.status.toUpperCase()}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(r.id);
                      }}
                      className="p-2 rounded bg-zinc-800"
                      aria-label="bookmark"
                    >
                      {r.bookmarked ? (
                        <BookmarkCheck className="text-yellow-400" />
                      ) : (
                        <Bookmark className="text-gray-300" />
                      )}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Create Form Modal (mobile-optimized) */}
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setShowPopup(false)}
            />
            <div className="relative w-full h-full sm:h-auto sm:max-w-5xl overflow-y-auto bg-zinc-900 rounded-none sm:rounded-lg p-4 sm:p-6 m-0 sm:m-4">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 z-10"
                onClick={() => setShowPopup(false)}
                aria-label="Tutup"
              >
                <X />
              </button>

              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                Form Laporan Arsip Baru
              </h2>

              <form
                onSubmit={handleCreateReport}
                className="grid gap-4 grid-cols-1 sm:grid-cols-3"
              >
                <div className="flex flex-col gap-3 border-b sm:border-b-0 sm:border-r border-zinc-800 pb-3 sm:pb-0 sm:pr-4">
                  <label className="text-sm text-gray-300">Judul Arsip</label>
                  <input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    type="text"
                    placeholder="Contoh: Laporan Operasi Khusus"
                    className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-white w-full"
                  />

                  <label className="text-sm text-gray-300">Jenis Arsip</label>
                  <select
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value)}
                    className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-white"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Rahasia">Rahasia</option>
                    <option value="Super Rahasia">Super Rahasia</option>
                    <option value="Pembatasan">Pembatasan</option>
                  </select>

                  <label className="text-sm text-gray-300">Prioritas</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Tinggi">Tinggi</option>
                  </select>
                </div>

                <div className="flex flex-col gap-3 sm:col-span-1">
                  <label className="text-sm text-gray-300">
                    Deskripsi Arsip
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={6}
                    placeholder="Tuliskan deskripsi laporan secara detail..."
                    className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-white w-full"
                  />
                </div>

                <div className="flex flex-col gap-3 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-3 sm:pt-0 sm:pl-4">
                  <label className="text-sm text-gray-300">Nama Pelapor</label>
                  <input
                    value={formReporterName}
                    onChange={(e) => setFormReporterName(e.target.value)}
                    type="text"
                    placeholder="Nama lengkap"
                    className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-white w-full"
                  />

                  <label className="text-sm text-gray-300">Unit / Satuan</label>
                  <input
                    value={formReporterUnit}
                    onChange={(e) => setFormReporterUnit(e.target.value)}
                    type="text"
                    placeholder="Contoh: Satintel"
                    className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm text-white w-full"
                  />

                  <label className="text-sm text-gray-300">Lampiran</label>
                  <input
                    ref={fileInputRef}
                    onChange={handleFilesChange}
                    type="file"
                    multiple
                    className="text-gray-300 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Validasi ukuran & upload dilakukan di backend nanti.
                  </div>
                </div>

                {/* Actions: full-width on mobile */}
                <div className="sm:col-span-3 flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="w-full sm:w-auto px-3 py-2 rounded bg-zinc-800 text-gray-300 text-sm hover:bg-zinc-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-3 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-500"
                  >
                    Simpan Laporan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal (mobile optimized) */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={closeDetail}
            />
            <div className="relative w-full h-full sm:h-auto sm:max-w-4xl overflow-y-auto bg-zinc-900 rounded-none sm:rounded-2xl p-4 sm:p-6 m-0 sm:m-4">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
                onClick={closeDetail}
                aria-label="Tutup"
              >
                <X />
              </button>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* LEFT: reporter + history + assets (stacked on mobile) */}
                <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-zinc-800 pb-4 sm:pb-0 sm:pr-4">
                  <div className="mb-4">
                    <div className="text-sm text-gray-300">Pelapor</div>
                    <div className="mt-2 text-sm text-gray-100 font-semibold">
                      {selected.reporter.name}
                    </div>
                    {selected.reporter.unit && (
                      <div className="text-xs text-gray-400">
                        {selected.reporter.unit}
                      </div>
                    )}
                    {selected.reporter.nrp && (
                      <div className="text-xs text-gray-400">
                        NRP: {selected.reporter.nrp}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-300">History</div>
                    <ul className="mt-2 text-xs text-gray-300 divide-y divide-zinc-800">
                      {selected.history.map((h) => (
                        <li key={h.id} className="py-2">
                          <div className="font-semibold text-gray-100 text-sm">
                            {h.actor}{" "}
                            <span className="text-[11px] text-gray-400 ml-2">
                              ({h.action})
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {new Date(h.at).toLocaleString()}
                          </div>
                          {h.note && (
                            <div className="text-[11px] text-gray-400 mt-1">
                              {h.note}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-sm text-gray-300 mb-2">Aset</div>
                    <div className="grid grid-cols-3 gap-2">
                      {selected.assets.length === 0 && (
                        <div className="text-xs text-gray-400">
                          Tidak ada aset
                        </div>
                      )}
                      {selected.assets.map((a) => (
                        <div
                          key={a.id}
                          className="bg-zinc-800 rounded p-2 flex flex-col items-center text-center text-xs"
                        >
                          <div className="mb-2">
                            {a.type === "image" ? (
                              <ImageIcon className="w-5 h-5 text-yellow-400" />
                            ) : a.type === "video" ? (
                              <VideoIcon className="w-5 h-5 text-yellow-400" />
                            ) : (
                              <FileIcon className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                          <div className="truncate w-full">{a.name}</div>
                          {a.url && (
                            <a
                              className="mt-1 text-[11px] text-yellow-400 hover:underline"
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Preview
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: informasi arsip & actions */}
                <div className="w-full sm:w-2/3 pl-0 sm:pl-4">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selected.title}
                  </h3>
                  <div className="text-sm text-gray-400 mb-4">
                    {selected.classification} • {selected.priority}
                  </div>

                  <div className="bg-zinc-800 rounded-md p-4 text-sm text-gray-100 mb-4">
                    {selected.description}
                  </div>

                  <div className="text-xs text-gray-400 mb-4">
                    <div>
                      Created:{" "}
                      <span className="text-gray-200 font-semibold">
                        {new Date(selected.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {selected.updatedAt && (
                      <div>
                        Updated:{" "}
                        <span className="text-gray-200 font-semibold">
                          {new Date(selected.updatedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div>
                      Status:{" "}
                      <span
                        className={`ml-2 px-2 py-1 rounded text-[12px] font-semibold ${
                          selected.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {selected.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {selected.status === "pending" && (
                      <button
                        onClick={() => handleVerify(selected.id)}
                        className="w-full sm:w-auto px-4 py-3 bg-green-500 text-black rounded font-semibold hover:bg-green-600"
                      >
                        Verifikasi
                      </button>
                    )}
                    <button
                      onClick={() =>
                        alert(
                          "Integrasikan viewer / download endpoint di backend"
                        )
                      }
                      className="w-full sm:w-auto px-4 py-3 bg-yellow-500 text-black rounded font-semibold"
                    >
                      Buka Viewer
                    </button>
                    <button
                      onClick={() =>
                        alert("Integrasikan download endpoint di backend")
                      }
                      className="w-full sm:w-auto px-4 py-3 bg-zinc-800 text-gray-200 rounded"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Catatan: tombol Verifikasi hanya demo — hubungkan ke backend &
                otorisasi admin untuk produksi.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
