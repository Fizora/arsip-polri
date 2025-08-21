"use client";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";

import { FileText, Shield, Users, Eye } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ===================== DUMMY DATA =====================
const chartData = {
  daily: {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    users: [10, 12, 8, 15, 9, 7, 11],
    archives: [20, 22, 18, 25, 19, 17, 21],
    accesses: [30, 32, 28, 35, 29, 27, 31],
  },
  weekly: {
    labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
    users: [50, 60, 55, 70],
    archives: [100, 120, 110, 130],
    accesses: [200, 220, 210, 230],
  },
  monthly: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
    users: [100, 120, 110, 130, 140, 150, 160, 170, 180, 190, 200, 210],
    archives: [200, 220, 210, 230, 240, 250, 260, 270, 280, 290, 300, 310],
    accesses: [300, 320, 310, 330, 340, 350, 360, 370, 380, 390, 400, 410],
  },
  yearly: {
    labels: ["2022", "2023", "2024", "2025"],
    users: [1000, 1200, 1100, 1300],
    archives: [2000, 2200, 2100, 2300],
    accesses: [3000, 3200, 3100, 3300],
  },
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
    title: { display: true, text: "Statistik Arsip & Pengguna" },
  },
};

function filterByDateRange(data, start, end) {
  return {
    labels: data.labels.slice(start, end + 1),
    users: data.users.slice(start, end + 1),
    archives: data.archives.slice(start, end + 1),
    accesses: data.accesses.slice(start, end + 1),
  };
}

// ===================== MAIN =====================
export default function DashboardPage() {
  const [filter, setFilter] = useState("daily");
  const [range, setRange] = useState([0, chartData[filter].labels.length - 1]);
  const isMobile = useMediaQuery({ maxWidth: 640 });

  React.useEffect(() => {
    setRange([0, chartData[filter].labels.length - 1]);
  }, [filter]);

  const filteredData = filterByDateRange(chartData[filter], range[0], range[1]);

  const data = {
    labels: filteredData.labels,
    datasets: [
      {
        label: "Jumlah Pengguna",
        data: filteredData.users,
        backgroundColor: "#facc15",
      },
      {
        label: "Jumlah Arsip",
        data: filteredData.archives,
        backgroundColor: "#38bdf8",
      },
      {
        label: "Jumlah Pengaksesan",
        data: filteredData.accesses,
        backgroundColor: "#a3e635",
      },
    ],
  };

  return (
    <div className="h-screen flex bg-zinc-950">
      {/* Sidebar tetap fixed full height */}
      <Sidebar />

      {/* Main content scrollable */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto p-6 lg:p-10 text-gray-200">
        {/* Header */}
        <Header />

        {/* Chart Section */}
        {!isMobile && (
          <section className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-white">
                Statistik Arsip & Pengguna
              </h2>
              <div className="flex gap-2">
                {(
                  [
                    { key: "daily", label: "Harian" },
                    { key: "weekly", label: "Mingguan" },
                    { key: "monthly", label: "Bulanan" },
                    { key: "yearly", label: "Tahunan" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition border ${
                      filter === f.key
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "bg-zinc-900 text-gray-200 border-zinc-800 hover:bg-yellow-400 hover:text-black"
                    }`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4 text-sm text-gray-400">
              {filter === "daily" &&
                "Statistik harian: Senin - Selasa, minggu berjalan."}
              {filter === "weekly" &&
                "Statistik mingguan: Minggu 1 - Minggu 4, bulan berjalan."}
              {filter === "monthly" &&
                "Statistik bulanan: Januari - Desember, tahun berjalan."}
              {filter === "yearly" && "Statistik tahunan: 2022 - 2025."}
            </div>
            <Bar
              options={chartOptions}
              data={data}
              className="bg-zinc-900 rounded-xl p-4"
            />
          </section>
        )}

        {/* Card Section */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="group bg-zinc-900/80 border border-zinc-800 p-6 rounded-xl shadow-lg flex flex-col items-start hover:bg-yellow-500 transition-colors duration-300 cursor-pointer">
            <FileText
              size={32}
              className="mb-3 text-yellow-400 group-hover:text-black"
            />
            <h2 className="text-base lg:text-lg font-semibold text-white group-hover:text-black mb-1">
              Total Arsip
            </h2>
            <p className="text-5xl lg:text-6xl font-extrabold mt-1 mb-2 text-yellow-400 group-hover:text-black">
              12,430
            </p>
            <span className="text-xs text-gray-400 group-hover:text-black mt-2">
              Semua arsip yang tersimpan
            </span>
          </div>

          <div className="group bg-zinc-900/80 border border-zinc-800 p-6 rounded-xl shadow-lg flex flex-col items-start hover:bg-yellow-500 transition-colors duration-300 cursor-pointer">
            <Shield
              size={32}
              className="mb-3 text-yellow-400 group-hover:text-black"
            />
            <h2 className="text-base lg:text-lg font-semibold text-white group-hover:text-black mb-1">
              Arsip Rahasia
            </h2>
            <p className="text-5xl lg:text-6xl font-extrabold mt-1 mb-2 text-yellow-400 group-hover:text-black">
              1,245
            </p>
            <span className="text-xs text-gray-400 group-hover:text-black mt-2">
              Akses terbatas dan terenkripsi
            </span>
          </div>

          <div className="group bg-zinc-900/80 border border-zinc-800 p-6 rounded-xl shadow-lg flex flex-col items-start hover:bg-yellow-500 transition-colors duration-300 cursor-pointer">
            <Users
              size={32}
              className="mb-3 text-yellow-400 group-hover:text-black"
            />
            <h2 className="text-base lg:text-lg font-semibold text-white group-hover:text-black mb-1">
              Pengguna Aktif
            </h2>
            <p className="text-5xl lg:text-6xl font-extrabold mt-1 mb-2 text-yellow-400 group-hover:text-black">
              84
            </p>
            <span className="text-xs text-gray-400 group-hover:text-black mt-2">
              User login 24 jam terakhir
            </span>
          </div>
        </section>

        {/* History Section */}
        <section className="bg-zinc-900/80 border border-zinc-800 rounded-xl shadow-lg p-6 mt-2 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">
            History Akses Aplikasi
          </h3>
          <ul className="divide-y divide-zinc-800">{/* isi history */}</ul>
        </section>
      </main>
    </div>
  );
}
