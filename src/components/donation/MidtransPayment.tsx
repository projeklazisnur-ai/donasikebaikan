"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

type SnapWindow = {
  snap?: {
    pay: (token: string, options: {
      onSuccess?: () => void;
      onPending?: () => void;
      onError?: () => void;
      onClose?: () => void;
    }) => void;
  };
};

interface Props {
  snapToken: string;
  donationId: string;
  onSuccess: () => void;
  onPending: () => void;
  onError: () => void;
}

export default function MidtransPayment({ snapToken, onSuccess, onPending, onError }: Props) {
  const snapSrc = process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  const called = useRef(false);

  function openSnap() {
    if (called.current) return;
    const win = window as unknown as SnapWindow;
    if (win.snap && snapToken) {
      called.current = true;
      win.snap.pay(snapToken, { onSuccess, onPending, onError, onClose: () => {} });
    }
  }

  // Kalau script sudah terlanjur dimuat (misalnya kembali ke halaman), langsung panggil
  useEffect(() => {
    openSnap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Script
      src={snapSrc}
      data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      strategy="afterInteractive"
      onLoad={openSnap}
    />
  );
}
