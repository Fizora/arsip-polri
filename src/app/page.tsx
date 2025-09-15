"use client";
import React, { useEffect, useRef, useState } from "react";
import { AuthLogin } from "@/service/auth.service";
import Image from "next/image";

/**
 * Minimal 2-step login:
 *  - Step 1: NRP/Email + Password
 *  - Step 2: Scan-only RFID (keyboard-emulating scanner)
 *
 * Notes:
 *  - Ganti bagian TODO dengan panggilan API server-side yang aman.
 *  - Tombol teks dibuat kecil agar minimalis.
 *  - Logo besar di tengah atas card sesuai permintaan.
 */

export default function MinimalLogin2FA() {
  type Step = "credentials" | "rfid" | "success";
  const [step, setStep] = useState<Step>("credentials");

  // credentials
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // scanner buffer
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  // accessibility live region
  const liveRef = useRef<HTMLDivElement | null>(null);

  // --- Step 1: verify credentials (mock) ---
  async function verifyCredentials(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError("NRP/Email dan Password wajib diisi.");
      return;
    }

    setLoading(true);
    setInfo("Memeriksa kredensial...");
    try {
      const res = await AuthLogin({ identifier, password });

      if (!res.status) {
        setLoading(false);
        setError("Login gagal: " + res.message);
        setInfo(null);
        return;
      }
      setLoading(false);
      setInfo(null);
      setStep("rfid");
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi Kesalahan Koneksi");
      }
      setInfo(null);
    }
  }

  // --- Step 2: verify RFID (mock) ---
  async function verifyRfidCode(code: string) {
    setLoading(true);
    setError(null);
    setInfo("Memverifikasi RFID...");
    // TODO: kirim code ke server untuk validasi device/ownership
    await new Promise((r) => setTimeout(r, 700));

    // simulasi rule: valid jika panjang >= 4 dan bukan '0000'
    if (code && code.length >= 4 && code !== "0000") {
      setLoading(false);
      setInfo(null);
      setStep("success");
    } else {
      setLoading(false);
      setError("RFID tidak valid. Silakan scan ulang.");
      setInfo("Menunggu scan RFID...");
    }
  }

  // --- global keydown listener only when step === "rfid" ---
  useEffect(() => {
    if (step !== "rfid") return;

    function resetBuffer() {
      bufferRef.current = "";
      lastKeyTimeRef.current = 0;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (loading) return; // ignore while verifying

      const now = Date.now();

      // if gap between keys too long -> assume human typing -> reset
      if (lastKeyTimeRef.current && now - lastKeyTimeRef.current > 1000) {
        bufferRef.current = "";
      }
      lastKeyTimeRef.current = now;

      // Enter submits buffer
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

      // Accept printable characters only (scanner usually emits them)
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }

      // safety: clear buffer after 1.2s inactivity
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        bufferRef.current = "";
        lastKeyTimeRef.current = 0;
      }, 1200);
    }

    // set instruction
    setInfo("Menunggu scan RFID... (gunakan RFID reader terdaftar)");
    setError(null);

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      resetBuffer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, loading]);

  function resetAll() {
    setStep("credentials");
    setIdentifier("");
    setPassword("");
    setLoading(false);
    setError(null);
    setInfo(null);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-xl">
          {/* Logo besar di tengah */}
          <div className="w-fit mx-auto">
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex justify-center items-center">
              <Image
                src="/logo.png"
                alt="Logo Polri"
                fill
                className="object-cover rounded-full drop-shadow-md"
              />
            </div>
          </div>

          {/* minimal header text under logo */}
          <div className="text-center mt-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-white">
              Sistem Arsip Digital
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Akses internal personel — autentikasi 2 langkah
            </p>
          </div>

          {/* content area */}
          <div>
            {step === "credentials" && (
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

                {error && <div className="text-xs text-red-400">{error}</div>}
                {info && <div className="text-xs text-gray-400">{info}</div>}

                <div className="flex gap-2 items-center mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-3 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium disabled:opacity-60"
                  >
                    {loading ? "Memeriksa..." : "Lanjutkan"}
                  </button>

                  <button
                    type="button"
                    onClick={resetAll}
                    className="px-3 py-2 rounded-md bg-zinc-800 text-xs text-gray-200 hover:bg-zinc-700"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            {step === "rfid" && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm font-semibold text-white">
                    Verifikasi 2-Langkah
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Langkah 2 — Scan RFID (hanya scan)
                  </div>
                </div>

                {/* large minimal scan area */}
                <div className="mt-3 p-4 rounded-lg bg-zinc-800 border border-zinc-700 text-center">
                  <div className="text-sm text-gray-200 mb-3">
                    {loading
                      ? "Memverifikasi..."
                      : info ?? "Silakan dekatkan kartu ke RFID reader"}
                  </div>

                  <div className="mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-md flex items-center justify-center border border-zinc-700 mb-3">
                    <svg
                      className={`w-10 h-10 ${
                        loading
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
                        // return to credentials
                        setStep("credentials");
                        setError(null);
                        setInfo(null);
                      }}
                      className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200 hover:bg-zinc-700"
                    >
                      Kembali
                    </button>

                    {/* small helper to re-trigger instruction */}
                    <button
                      onClick={() => {
                        setError(null);
                        setInfo("Menunggu scan RFID...");
                        // focusing window to encourage capturing events (scanner typically works regardless)
                        window.focus();
                      }}
                      className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200 hover:bg-zinc-700"
                    >
                      Siap
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Hanya pemindaian RFID dari reader terdaftar yang diterima —
                  tidak ada input manual.
                </div>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
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
                  Akses Diterima
                </div>
                <div className="text-xs text-gray-300">
                  Autentikasi dua langkah berhasil.
                </div>

                <div className="flex gap-2 justify-center mt-2">
                  <button
                    onClick={() => {
                      window.location.href = "/dashboard";
                    }}
                    className="px-3 py-1.5 rounded-md bg-yellow-500 text-black text-sm font-medium"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={resetAll}
                    className="px-3 py-1.5 rounded-md bg-zinc-800 text-xs text-gray-200"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* live region for screen readers */}
          <div ref={liveRef} aria-live="polite" className="sr-only">
            {info ?? error ?? ""}
          </div>
        </div>
      </div>
    </div>
  );
}
