"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Props {
  donationId: string;
}

export function VerifyButtons({ donationId }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handle(action: "approve" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/donations/verify/${donationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const j = await res.json();
        alert(j.error ?? "Gagal memproses verifikasi");
      }
    } catch {
      alert("Gagal terhubung ke server");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => handle("approve")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {loading === "approve" ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
        Terima
      </button>
      <button
        onClick={() => handle("reject")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
      >
        {loading === "reject" ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
        Tolak
      </button>
    </div>
  );
}
