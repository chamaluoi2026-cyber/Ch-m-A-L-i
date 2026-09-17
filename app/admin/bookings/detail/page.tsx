"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookingDetailView } from "@/components/admin/booking-detail-view";

function DetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  return <BookingDetailView bookingId={id} />;
}

export default function AdminBookingDetailPageStandalone() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="size-10 mx-auto animate-spin rounded-full border-4 border-forest border-t-transparent" />
          <p className="mt-4 text-xs font-bold text-ink/60">Đang tải chi tiết đơn...</p>
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
