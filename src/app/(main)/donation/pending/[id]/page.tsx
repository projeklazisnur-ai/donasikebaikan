import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import ManualTransferForm from "@/components/donation/ManualTransferForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Selesaikan Pembayaran" };

interface BankAccount { bank: string; number: string; holder: string }

export default async function DonationPendingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: donation }, { data: settingsRows }] = await Promise.all([
    supabase
      .from("donations")
      .select("id, donor_name, donor_email, amount, status, payment_method, transaction_id, campaigns(title, slug)")
      .eq("id", id)
      .single(),
    supabase.from("site_settings").select("key, value"),
  ]);

  if (!donation) notFound();

  const siteSettings: Record<string, string> = {};
  for (const row of settingsRows ?? []) siteSettings[row.key] = row.value;

  let bankAccounts: BankAccount[] = [];
  try { bankAccounts = JSON.parse(siteSettings.bank_accounts ?? "[]"); } catch { bankAccounts = []; }
  const qrisUrl = siteSettings.qris_image_url ?? "";

  const campaign = donation.campaigns as unknown as { title: string; slug: string } | null;
  const isManualTransfer = donation.payment_method === "transfer_manual";

  return (
    <div className="min-h-[80vh] px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Menunggu Pembayaran</h1>
            <p className="text-sm text-slate-500">ID: {donation.transaction_id}</p>
          </div>
        </div>

        {/* Donation Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-500 text-sm">Campaign</span>
            <span className="font-semibold text-slate-900 text-sm text-right max-w-[200px]">
              {campaign?.title ?? "-"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">Total Donasi</span>
            <span className="text-xl font-bold text-primary-600">{formatRupiah(donation.amount)}</span>
          </div>
        </div>

        {isManualTransfer ? (
          <>
            {/* Bank Accounts */}
            {bankAccounts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4">Transfer ke Rekening Berikut</h2>
                <div className="space-y-3">
                  {bankAccounts.map((acc, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {acc.bank}
                      </div>
                      <div>
                        <p className="font-mono font-bold text-slate-900">{acc.number}</p>
                        <p className="text-xs text-slate-500">a.n. {acc.holder}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs text-amber-800 font-medium">
                    Mohon transfer tepat <span className="font-bold">{formatRupiah(donation.amount)}</span> untuk mempercepat verifikasi.
                  </p>
                </div>
              </div>
            )}

            {/* QRIS */}
            {qrisUrl && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm text-center">
                <h2 className="font-semibold text-slate-900 mb-1">Atau Bayar via QRIS</h2>
                <p className="text-xs text-slate-400 mb-4">Scan QR code dengan aplikasi e-wallet atau mobile banking apapun</p>
                <div className="inline-block bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
                  <Image
                    src={qrisUrl}
                    alt="QRIS"
                    width={220}
                    height={220}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-slate-400 mt-3">Jumlah: <span className="font-bold text-slate-700">{formatRupiah(donation.amount)}</span></p>
              </div>
            )}

            {/* Upload Proof Form */}
            <ManualTransferForm donationId={donation.id} donorEmail={donation.donor_email} />
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm">
            <p className="text-slate-600">
              Pembayaran Anda sedang diproses. Halaman ini akan otomatis diperbarui saat pembayaran selesai.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
