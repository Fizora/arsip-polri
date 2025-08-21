"use client";
import React from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header() {
  return (
    <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      {/* Judul & Subjudul */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-1 leading-tight">
          Dashboard
        </h1>

        <p className="text-gray-400 text-base lg:text-lg">
          Selamat datang di Pusat Arsip Digital Kepolisian
        </p>
      </div>

      {/* Info Admin */}
      <div className="flex items-center gap-3 bg-zinc-900/70 px-4 py-2 rounded-xl border border-zinc-800">
        <img
          src="/logo.png"
          className="w-11 h-11 rounded-full border border-zinc-700 shadow"
          alt="User"
        />
        <div className="flex flex-col">
          <span className="text-white font-semibold leading-tight text-base lg:text-lg">
            Admin Polri
          </span>
          <span className="text-xs text-yellow-400">Superuser</span>
        </div>
      </div>
    </header>
  );
}
