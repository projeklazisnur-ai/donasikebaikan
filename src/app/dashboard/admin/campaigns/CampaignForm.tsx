"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { createCampaign, updateCampaign } from "./actions";

interface Category { id: string; name: string }

interface CampaignData {
  id: string;
  title: string;
  short_description: string;
  category_id: string;
  cover_image: string;
  target_amount: number;
  deadline: string;
  is_featured: boolean;
  is_urgent: boolean;
  status: string;
}

interface Props {
  categories: Category[];
  campaign?: CampaignData;
}

export default function CampaignForm({ categories, campaign }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(campaign?.cover_image ?? "");
  const [imagePreview, setImagePreview] = useState(campaign?.cover_image ?? "");
  const [isUploading, setIsUploading] = useState(false);

  const isEdit = !!campaign;

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe dan ukuran
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WebP, dll)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB");
      return;
    }

    // Preview lokal langsung
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setError("");
    setIsUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from("campaign-covers")
        .upload(filename, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("campaign-covers")
        .getPublicUrl(data.path);

      setImageUrl(publicUrl);
    } catch (err) {
      setError("Gagal upload gambar: " + (err as Error).message);
      setImagePreview(campaign?.cover_image ?? "");
      setImageUrl(campaign?.cover_image ?? "");
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage() {
    setImageUrl("");
    setImagePreview("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isUploading) return;
    setError("");
    const formData = new FormData(e.currentTarget);
    // Pastikan cover_image pakai URL yang sudah diupload
    formData.set("cover_image", imageUrl);

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateCampaign(campaign.id, formData);
        } else {
          await createCampaign(formData);
        }
        router.push("/dashboard/admin/campaigns");
        router.refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <Input
        label="Judul Campaign"
        name="title"
        required
        placeholder="Contoh: Bantu Santri Yatim Beli Al-Qur'an"
        defaultValue={campaign?.title}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Deskripsi Singkat <span className="text-red-500">*</span></label>
        <Textarea
          name="short_description"
          required
          rows={3}
          placeholder="Deskripsi singkat yang muncul di kartu campaign..."
          defaultValue={campaign?.short_description}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Kategori <span className="text-red-500">*</span></label>
        <select
          name="category_id"
          required
          defaultValue={campaign?.category_id ?? ""}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Foto Cover — file upload dengan preview */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Foto Cover</label>
        <input type="hidden" name="cover_image" value={imageUrl} />

        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <div className="aspect-video relative">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized={imagePreview.startsWith("blob:")}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <span className="text-white text-sm ml-2">Mengupload...</span>
                </div>
              )}
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl p-8 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <ImagePlus className="w-6 h-6 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">Klik untuk pilih gambar</p>
              <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP — maks. 5 MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}

        {/* Ganti gambar button kalau sudah ada preview */}
        {imagePreview && !isUploading && (
          <label className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-medium cursor-pointer hover:underline w-fit">
            <ImagePlus size={13} />
            Ganti gambar
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Target Dana (Rp)"
          name="target_amount"
          type="number"
          required
          min={10000}
          step={1000}
          placeholder="5000000"
          defaultValue={campaign?.target_amount}
        />

        <Input
          label="Deadline"
          name="deadline"
          type="date"
          required
          min={todayStr}
          defaultValue={campaign?.deadline ? campaign.deadline.split("T")[0] : ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Status</label>
        <select
          name="status"
          defaultValue={campaign?.status ?? "draft"}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="draft">Draft</option>
          <option value="active">Aktif</option>
          <option value="completed">Selesai</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_featured" defaultChecked={campaign?.is_featured} className="rounded" />
          <span className="text-sm text-slate-700">Campaign Pilihan (Featured)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="is_urgent" defaultChecked={campaign?.is_urgent} className="rounded" />
          <span className="text-sm text-slate-700">Mendesak (Urgent)</span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button type="submit" loading={isPending || isUploading}>
          {isUploading ? "Mengupload gambar..." : isEdit ? "Simpan Perubahan" : "Buat Campaign"}
        </Button>
      </div>
    </form>
  );
}
