"use client";
import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useMediaQuery } from "react-responsive";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const chartData = {
  labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
  datasets: [
    {
      label: "Pengguna",
      data: [12, 19, 3, 5, 2, 3, 7],
      backgroundColor: "#facc15",
    },
    {
      label: "Arsip",
      data: [8, 11, 7, 6, 4, 5, 9],
      backgroundColor: "#38bdf8",
    },
    {
      label: "Pengaksesan",
      data: [15, 10, 5, 8, 6, 4, 12],
      backgroundColor: "#22d3ee",
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "#facc15",
        font: { family: "Poppins, sans-serif" },
      },
    },
    title: {
      display: true,
      text: "Statistik Arsip Mingguan",
      color: "#facc15",
      font: { size: 18, family: "Poppins, sans-serif" },
    },
  },
  scales: {
    x: {
      ticks: { color: "#facc15" },
      grid: { color: "#27272a" },
    },
    y: {
      ticks: { color: "#facc15" },
      grid: { color: "#27272a" },
    },
  },
};

// Data khusus Doughnut untuk mobile
const doughnutData = {
  pengguna: {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    datasets: [
      {
        data: [12, 19, 3, 5, 2, 3, 7],
        backgroundColor: [
          "#facc15",
          "#fcd34d",
          "#fde047",
          "#fbbf24",
          "#f59e0b",
          "#d97706",
          "#b45309",
        ],
      },
    ],
  },
  arsip: {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    datasets: [
      {
        data: [8, 11, 7, 6, 4, 5, 9],
        backgroundColor: [
          "#38bdf8",
          "#0ea5e9",
          "#0284c7",
          "#0369a1",
          "#075985",
          "#0c4a6e",
          "#082f49",
        ],
      },
    ],
  },
  pengaksesan: {
    labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    datasets: [
      {
        data: [15, 10, 5, 8, 6, 4, 12],
        backgroundColor: [
          "#22d3ee",
          "#06b6d4",
          "#0891b2",
          "#0e7490",
          "#155e75",
          "#164e63",
          "#083344",
        ],
      },
    ],
  },
};

export default function ChartSection() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <section className="bg-zinc-900 rounded-xl shadow-lg p-4 sm:p-8 border border-zinc-800 w-full max-w-4xl mx-auto flex flex-col gap-6">
      {isMobile ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-zinc-800 p-4 rounded-xl">
            <h2 className="text-yellow-400 text-center font-semibold mb-3">
              Pengguna
            </h2>
            <Doughnut data={doughnutData.pengguna} />
          </div>
          <div className="bg-zinc-800 p-4 rounded-xl">
            <h2 className="text-sky-400 text-center font-semibold mb-3">
              Arsip
            </h2>
            <Doughnut data={doughnutData.arsip} />
          </div>
          <div className="bg-zinc-800 p-4 rounded-xl">
            <h2 className="text-cyan-400 text-center font-semibold mb-3">
              Pengaksesan
            </h2>
            <Doughnut data={doughnutData.pengaksesan} />
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[300px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </section>
  );
}
