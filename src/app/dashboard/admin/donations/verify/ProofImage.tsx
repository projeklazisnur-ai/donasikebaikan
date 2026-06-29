"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function ProofImage({ url }: { url: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-32 h-32 flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200 text-slate-400">
        <ImageOff className="w-8 h-8" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Bukti transfer"
      onError={() => setError(true)}
      className="w-32 h-32 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition-opacity"
    />
  );
}
