"use client";

import { Trash2 } from "lucide-react";
import { deleteCampaignAction } from "./actions";

export function DeleteCampaignButton({ id }: { id: string }) {
  return (
    <form
      action={deleteCampaignAction}
      onSubmit={(e) => {
        if (!confirm("Hapus campaign ini?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        title="Hapus"
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
