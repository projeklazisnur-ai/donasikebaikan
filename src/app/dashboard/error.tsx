"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="font-bold text-slate-900 text-xl mb-2">Terjadi Kesalahan</h2>
        <p className="text-slate-500 text-sm mb-6">
          Halaman ini tidak dapat dimuat. Coba muat ulang atau kembali ke halaman sebelumnya.
        </p>
        <button
          onClick={reset}
          className="bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
