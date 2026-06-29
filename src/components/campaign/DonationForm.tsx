"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Heart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatRupiah } from "@/lib/utils";

const QUICK_AMOUNTS = [25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

const schema = z.object({
  amount: z.number({ error: "Nominal harus berupa angka" }).min(5_000, "Minimal donasi Rp 5.000"),
  donor_name: z.string().min(2, "Nama minimal 2 karakter"),
  donor_email: z.string().email("Format email tidak valid"),
  donor_phone: z.string().optional(),
  message: z.string().max(300, "Maksimal 300 karakter").optional(),
  is_anonymous: z.boolean().optional(),
});

type DonationFormValues = z.infer<typeof schema>;

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
}

export default function DonationForm({ campaignId, campaignTitle }: DonationFormProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DonationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { is_anonymous: false },
  });

  const handleQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    setValue("amount", amount);
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomAmount(raw ? Number(raw).toLocaleString("id-ID") : "");
    setSelectedAmount(null);
    setValue("amount", Number(raw));
  };

  const onSubmit = async (data: DonationFormValues) => {
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/donations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          campaign_id: campaignId,
          is_anonymous: isAnonymous,
          payment_method: "transfer_manual",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFormError(json.error ?? "Terjadi kesalahan. Coba lagi.");
        return;
      }

      if (json.donation_id) {
        window.location.href = `/donation/pending/${json.donation_id}`;
      }
    } catch {
      setFormError("Gagal terhubung ke server. Periksa koneksi dan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-primary-600 fill-primary-600" />
        Donasi Sekarang
      </h3>

      {formError && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Quick Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Nominal</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => handleQuickAmount(amt)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  selectedAmount === amt
                    ? "bg-primary-600 text-white border-primary-600"
                    : "border-slate-200 text-slate-700 hover:border-primary-300 hover:text-primary-600"
                }`}
              >
                {formatRupiah(amt, true)}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmount}
              placeholder="Nominal lain..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
        </div>

        {/* Donor Info */}
        <Input
          label="Nama"
          placeholder={isAnonymous ? "Hamba Allah" : "Nama lengkap Anda"}
          disabled={isAnonymous}
          error={errors.donor_name?.message}
          {...register("donor_name")}
        />

        <div className="flex items-center gap-2 -mt-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => {
              setIsAnonymous(e.target.checked);
              if (e.target.checked) setValue("donor_name", "Hamba Allah");
            }}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="anonymous" className="text-xs text-slate-600">Donasi sebagai Hamba Allah (anonim)</label>
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="email@kamu.com"
          error={errors.donor_email?.message}
          {...register("donor_email")}
        />

        <Input
          label="Nomor WhatsApp (opsional)"
          type="tel"
          placeholder="08xxxxxxxxxx"
          hint="Untuk pengiriman bukti donasi"
          error={errors.donor_phone?.message}
          {...register("donor_phone")}
        />

        {/* Message/Prayer */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Doa / Pesan <span className="text-slate-400 font-normal">(opsional)</span>
          </label>
          <textarea
            placeholder="Tulis doa atau pesan untuk campaign ini..."
            rows={3}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            {...register("message")}
          />
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
        </div>

        {/* Info pembayaran */}
        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">Cara pembayaran:</p>
          <p>1. Klik Donasi → isi data → lihat nomor rekening & QRIS</p>
          <p>2. Transfer sesuai nominal, lalu upload bukti</p>
          <p>3. Tim kami verifikasi dalam 1×24 jam</p>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          className="mt-2"
        >
          <Heart className="w-4 h-4 fill-white" />
          Donasi Sekarang
        </Button>

        <p className="text-xs text-center text-slate-400">
          Dana 100% tersalurkan untuk {campaignTitle}
        </p>
      </form>
    </div>
  );
}
