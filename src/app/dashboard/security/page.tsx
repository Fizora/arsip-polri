"use client";
import Sidebar from "@/components/Sidebar";
import React from "react";

export default function SecurityPage() {
  // Data dummy untuk log akses
  const logs = [
    {
      id: 1,
      user: "Admin Polri",
      role: "Superuser",
      ip: "192.168.1.10",
      device: "Chrome - Windows",
      time: "20 Agustus 2025, 07:30",
      status: "Berhasil",
    },
    {
      id: 2,
      user: "Operator 1",
      role: "Staff Arsip",
      ip: "192.168.1.24",
      device: "Safari - iOS",
      time: "20 Agustus 2025, 07:10",
      status: "Berhasil",
    },
    {
      id: 3,
      user: "Unknown",
      role: "Tidak diketahui",
      ip: "103.122.45.99",
      device: "Firefox - Linux",
      time: "20 Agustus 2025, 06:50",
      status: "Ditolak",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar />

      <main className=" flex-1 p-6 lg:p-10 text-gray-200 h-screen overflow-y-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-1 leading-tight">
              Security
            </h1>
            <p className="text-gray-400 text-base lg:text-lg">
              Audit keamanan dan log akses sistem
            </p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900/70 px-4 py-2 rounded-xl border border-zinc-800">
            <img
              src="/logo.png"
              className="w-11 h-11 rounded-full border border-zinc-700 shadow"
            />
            <div className="flex flex-col">
              <span className="text-white font-semibold leading-tight text-base lg:text-lg">
                Admin Polri
              </span>
              <span className="text-xs text-yellow-400">Superuser</span>
            </div>
          </div>
        </header>

        {/* Status Keamanan */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              Status Server
            </h3>
            <p className="text-green-400 font-medium">Normal</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              Status Database
            </h3>
            <p className="text-green-400 font-medium">Terenkripsi</p>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              Session Aktif
            </h3>
            <p className="text-sky-400 font-medium">5 User Online</p>
          </div>
        </section>

        {/* Log Akses */}
        <section className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow overflow-x-auto">
          <h2 className="text-xl font-semibold text-white mb-4">Log Akses</h2>
          <table className="w-full text-sm">
            <thead className="text-left border-b border-zinc-800">
              <tr>
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">IP</th>
                <th className="py-2 px-3">Device</th>
                <th className="py-2 px-3">Waktu</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-zinc-800">
                  <td className="py-2 px-3">{log.user}</td>
                  <td className="py-2 px-3 text-gray-400">{log.role}</td>
                  <td className="py-2 px-3">{log.ip}</td>
                  <td className="py-2 px-3">{log.device}</td>
                  <td className="py-2 px-3">{log.time}</td>
                  <td
                    className={`py-2 px-3 font-medium ${
                      log.status === "Berhasil"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {log.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Quick Action */}
        <section className="mt-8 flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-lg transition">
            Aktifkan Verifikasi 2FA
          </button>
          <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition">
            Force Logout Semua Sesi
          </button>
        </section>
      </main>
    </div>
  );
}
