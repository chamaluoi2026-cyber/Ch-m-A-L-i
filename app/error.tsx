"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log masked error safely on client console without exposing full stack to UI
    console.error("[Production Error Boundary caught exception]:", error.message);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#F8F9FA]">
      <div className="max-w-md w-full text-center bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-black/5">
        <div className="size-16 bg-rose-50 text-rose-600 rounded-2xl grid place-items-center mx-auto mb-5 shadow-inner">
          <AlertCircle className="size-8" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[#B86F3C]">
          Thông báo hệ thống
        </p>

        <h2 className="mt-2 text-xl md:text-2xl font-black text-stone-900 tracking-tight">
          Không thể tải dữ liệu
        </h2>

        <p className="mt-2.5 text-xs md:text-sm text-stone-600 leading-relaxed">
          Đã có lỗi tạm thời trong quá trình xử lý yêu cầu. Dữ liệu của bạn được đảm bảo an toàn. Vui lòng thử lại.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F5C4A] hover:bg-[#0F5C4A]/90 text-white text-xs font-bold rounded-xl shadow-md py-2.5 px-5"
          >
            <RotateCcw className="size-3.5" />
            Thử lại
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold rounded-xl py-2.5 px-5"
          >
            <Link href="/">
              <Home className="size-3.5" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
