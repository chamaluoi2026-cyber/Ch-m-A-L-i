import Link from "next/link";
import { LayoutDashboard, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-[#F4F6F5] px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-black/5">
        <div className="size-20 bg-amber-50 text-amber-600 rounded-3xl grid place-items-center mx-auto mb-6 shadow-inner">
          <ShieldAlert className="size-10" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#B86F3C]">
          Quản Trị CMS • 404
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight">
          Trang quản trị không tồn tại
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Mục quản trị hoặc bản ghi bạn đang truy cập không tồn tại hoặc đã được di chuyển trong hệ thống.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild className="bg-[#0F5C4A] hover:bg-[#0F5C4A]/90 text-white text-xs font-bold rounded-xl py-2.5 px-5 shadow-md">
            <Link href="/admin">
              <LayoutDashboard className="size-4 mr-1.5" />
              Bảng điều khiển Admin
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
