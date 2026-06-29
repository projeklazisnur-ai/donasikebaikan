"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload, Save, ImageIcon, Type, AlignLeft, CheckCircle, AlertCircle,
  Loader2, Smartphone, Monitor, CreditCard, Plus, Trash2, QrCode,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveSiteSettings } from "./actions";

interface BankAccount {
  bank: string;
  number: string;
  holder: string;
}

interface Props {
  settings: Record<string, string>;
}

function parseBankAccounts(raw: string | undefined): BankAccount[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as BankAccount[]; } catch { return []; }
}

export default function SettingsClient({ settings }: Props) {
  // Hero text
  const [headline, setHeadline] = useState(settings.hero_headline ?? "Satu Sedekah, Seribu Doa");
  const [subtitle, setSubtitle] = useState(settings.hero_subtitle ?? "Zakat & Sedekah tersalur transparan — setiap donasi tercatat, setiap dampak terbukti");

  // Banner images
  const [bannerUrl, setBannerUrl] = useState(settings.hero_banner_url ?? "");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  const [bannerMobileUrl, setBannerMobileUrl] = useState(settings.hero_banner_mobile_url ?? "");
  const [bannerMobilePreview, setBannerMobilePreview] = useState<string | null>(null);
  const [bannerMobileUploading, setBannerMobileUploading] = useState(false);

  // Bank accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(
    parseBankAccounts(settings.bank_accounts) ||
    [{ bank: "", number: "", holder: "" }]
  );

  // QRIS
  const [qrisUrl, setQrisUrl] = useState(settings.qris_image_url ?? "");
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [qrisUploading, setQrisUploading] = useState(false);

  // Form status
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const desktopRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const qrisRef = useRef<HTMLInputElement>(null);

  const currentBanner = (bannerPreview ?? bannerUrl) || "/banner-donasi.png";
  const currentMobileBanner = (bannerMobilePreview ?? bannerMobileUrl) || currentBanner;

  async function uploadToStorage(file: File, prefix: string): Promise<string> {
    if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
    if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 5 MB");

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${prefix}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("site-assets")
      .upload(filename, file, { upsert: true });

    if (error) throw new Error(`Upload gagal: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from("site-assets")
      .getPublicUrl(data.path);

    return publicUrl;
  }

  async function handleDesktopChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerPreview(URL.createObjectURL(file));
    setBannerUploading(true);
    setErrorMsg("");
    try {
      const url = await uploadToStorage(file, "hero-banner");
      setBannerUrl(url);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setBannerPreview(null);
    } finally {
      setBannerUploading(false);
    }
  }

  async function handleMobileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerMobilePreview(URL.createObjectURL(file));
    setBannerMobileUploading(true);
    setErrorMsg("");
    try {
      const url = await uploadToStorage(file, "hero-banner-mobile");
      setBannerMobileUrl(url);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setBannerMobilePreview(null);
    } finally {
      setBannerMobileUploading(false);
    }
  }

  async function handleQrisChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrisPreview(URL.createObjectURL(file));
    setQrisUploading(true);
    setErrorMsg("");
    try {
      const url = await uploadToStorage(file, "qris");
      setQrisUrl(url);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setQrisPreview(null);
    } finally {
      setQrisUploading(false);
    }
  }

  function addBankAccount() {
    setBankAccounts((prev) => [...prev, { bank: "", number: "", holder: "" }]);
  }

  function removeBankAccount(index: number) {
    setBankAccounts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBankAccount(index: number, field: keyof BankAccount, value: string) {
    setBankAccounts((prev) =>
      prev.map((acc, i) => (i === index ? { ...acc, [field]: value } : acc))
    );
  }

  const isUploading = bannerUploading || bannerMobileUploading || qrisUploading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    setStatus("saving");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.set("hero_headline", headline);
      formData.set("hero_subtitle", subtitle);
      if (bannerUrl) formData.set("hero_banner_url", bannerUrl);
      if (bannerMobileUrl) formData.set("hero_banner_mobile_url", bannerMobileUrl);

      const validBanks = bankAccounts.filter((a) => a.bank.trim() && a.number.trim());
      formData.set("bank_accounts", JSON.stringify(validBanks));

      if (qrisUrl) formData.set("qris_image_url", qrisUrl);

      const result = await saveSiteSettings(formData);

      if (result.error) {
        setStatus("error");
        setErrorMsg(result.error);
      } else {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message ?? "Terjadi kesalahan tak terduga");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Banner Hero ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary-600" />
          <h2 className="font-bold text-slate-900">Banner Hero</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Desktop */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Monitor className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">Desktop</p>
              <span className="text-xs text-slate-400 ml-1">1920×1080 px (16:9)</span>
            </div>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 mb-3">
              <Image src={currentBanner} alt="Banner desktop" fill className="object-cover" unoptimized={!!bannerPreview} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <p className="text-sm font-black drop-shadow truncate max-w-[200px]">{headline}</p>
              </div>
              {bannerUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div
              onClick={() => !bannerUploading && desktopRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
            >
              <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
              <p className="text-sm font-medium text-slate-600">{bannerUploading ? "Mengupload..." : "Klik untuk ganti"}</p>
              <p className="text-xs text-slate-400 mt-0.5">Landscape · maks 5 MB</p>
              <input ref={desktopRef} type="file" accept="image/*" onChange={handleDesktopChange} className="hidden" />
            </div>
          </div>

          {/* Mobile */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-medium text-slate-700">Mobile</p>
              <span className="text-xs text-slate-400 ml-1">750×1334 px (9:16)</span>
            </div>
            <div className="relative w-full aspect-[9/16] max-h-64 rounded-xl overflow-hidden bg-slate-100 mb-3">
              <Image src={currentMobileBanner} alt="Banner mobile" fill className="object-cover" unoptimized={!!bannerMobilePreview} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {bannerMobileUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <div
              onClick={() => !bannerMobileUploading && mobileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
            >
              <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
              <p className="text-sm font-medium text-slate-600">{bannerMobileUploading ? "Mengupload..." : "Klik untuk ganti"}</p>
              <p className="text-xs text-slate-400 mt-0.5">Portrait · maks 5 MB</p>
              <input ref={mobileRef} type="file" accept="image/*" onChange={handleMobileChange} className="hidden" />
            </div>
            <p className="text-xs text-slate-400 mt-2">Jika tidak diisi, gambar desktop dipakai sebagai fallback</p>
          </div>

        </div>
      </div>

      {/* ── Teks Hero ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Type className="w-5 h-5 text-primary-600" />
          <h2 className="font-bold text-slate-900">Teks Hero</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Headline Utama</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Satu Sedekah, Seribu Doa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5" /> Subtitle
            </label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Zakat & Sedekah tersalur transparan..."
            />
          </div>
        </div>
      </div>

      {/* ── Info Rekening Bank ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <h2 className="font-bold text-slate-900">Rekening Bank</h2>
          </div>
          <button
            type="button"
            onClick={addBankAccount}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Rekening
          </button>
        </div>
        <div className="p-6 space-y-4">
          {bankAccounts.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Belum ada rekening. Klik "Tambah Rekening" untuk menambahkan.</p>
          )}
          {bankAccounts.map((acc, i) => (
            <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nama Bank</label>
                  <input
                    type="text"
                    value={acc.bank}
                    onChange={(e) => updateBankAccount(i, "bank", e.target.value)}
                    placeholder="BRI / BCA / Mandiri"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    value={acc.number}
                    onChange={(e) => updateBankAccount(i, "number", e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Atas Nama</label>
                  <input
                    type="text"
                    value={acc.holder}
                    onChange={(e) => updateBankAccount(i, "holder", e.target.value)}
                    placeholder="LAZIS NUR"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeBankAccount(i)}
                className="mt-5 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Hapus rekening"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <p className="text-xs text-slate-400">Rekening ini ditampilkan di halaman konfirmasi transfer donasi.</p>
        </div>
      </div>

      {/* ── QRIS ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary-600" />
          <h2 className="font-bold text-slate-900">QRIS</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Preview */}
            <div className="shrink-0">
              <p className="text-xs font-medium text-slate-500 mb-2">Preview</p>
              <div className="w-40 h-40 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                {(qrisPreview || qrisUrl) ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={(qrisPreview ?? qrisUrl)!}
                      alt="QRIS"
                      fill
                      className="object-contain p-2"
                      unoptimized={!!qrisPreview}
                    />
                    {qrisUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <QrCode className="w-16 h-16 text-slate-200" />
                )}
              </div>
            </div>

            {/* Upload */}
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 mb-1">Upload Gambar QRIS</p>
              <p className="text-xs text-slate-400 mb-3">
                Upload foto/scan QR code QRIS. Format PNG atau JPG, latar belakang putih, maks 5 MB.
              </p>
              <div
                onClick={() => !qrisUploading && qrisRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
              >
                <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-sm font-medium text-slate-600">
                  {qrisUploading ? "Mengupload..." : qrisUrl ? "Klik untuk ganti" : "Klik untuk upload QRIS"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">PNG / JPG · maks 5 MB</p>
                <input ref={qrisRef} type="file" accept="image/*" onChange={handleQrisChange} className="hidden" />
              </div>
              {qrisUrl && !qrisUploading && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> QRIS sudah diupload
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">QRIS ditampilkan di halaman konfirmasi donasi sebagai opsi pembayaran alternatif.</p>
        </div>
      </div>

      {/* Status messages */}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}
        </div>
      )}
      {status === "success" && (
        <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 text-sm px-4 py-3 rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Pengaturan berhasil disimpan!
        </div>
      )}

      <button
        type="submit"
        disabled={status === "saving" || isUploading}
        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-300 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
      >
        {status === "saving" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
        ) : isUploading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload gambar...</>
        ) : (
          <><Save className="w-4 h-4" /> Simpan Pengaturan</>
        )}
      </button>
    </form>
  );
}
