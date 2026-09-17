"use client";

import { useParams } from "next/navigation";
import { BookingDetailView } from "@/components/admin/booking-detail-view";

export default function AdminBookingDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || (typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "");
  const bookingId = rawId ? decodeURIComponent(rawId).trim() : undefined;

  return <BookingDetailView bookingId={bookingId} />;
}
