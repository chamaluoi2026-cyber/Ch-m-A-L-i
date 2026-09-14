import { Compass } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#F8F9FA]/60">
      <div className="relative size-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#0F5C4A]/10 animate-ping" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0F5C4A] border-r-[#B86F3C] animate-spin" />
        <Compass className="size-8 text-[#0F5C4A] animate-pulse" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#0F5C4A]">
        Chạm A Lưới
      </p>
      <p className="text-xs text-stone-500 mt-1 animate-pulse">
        Đang tải dữ liệu trải nghiệm...
      </p>
    </div>
  );
}
