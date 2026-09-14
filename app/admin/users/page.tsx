import { Shield, ShieldAlert, User, Users, Briefcase, DollarSign, Headphones, FileText } from "lucide-react";
import { getAllUsers } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  const users = getAllUsers();

  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case "SUPER_ADMIN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <ShieldAlert className="size-3" /> Super Admin
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <Shield className="size-3" /> Admin
          </span>
        );
      case "CONTENT_MANAGER":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <FileText className="size-3" /> Content Manager
          </span>
        );
      case "SALES":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Briefcase className="size-3" /> Sales
          </span>
        );
      case "FINANCE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <DollarSign className="size-3" /> Finance
          </span>
        );
      case "SUPPORT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
            <Headphones className="size-3" /> Support
          </span>
        );
      case "BUSINESS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold bg-forest/15 text-forest border border-forest/30">
            <Briefcase className="size-3" /> Business (Đối tác)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold bg-gray-100 text-gray-700">
            <User className="size-3" /> Customer (Khách hàng)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Quản lý Tài khoản & Phân quyền</h1>
          <p className="text-xs text-ink/60 mt-1">
            Hệ thống phân quyền 8 vai trò (RBAC): SUPER_ADMIN, ADMIN, CONTENT_MANAGER, SALES, FINANCE, SUPPORT, BUSINESS, CUSTOMER
          </p>
        </div>
        <div className="rounded-2xl bg-forest/10 px-4 py-2 text-xs font-bold text-forest">
          {users.length} tài khoản trong hệ thống
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
        <table className="w-full text-left text-xs">
          <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
            <tr>
              <th className="p-4">Họ và tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Số điện thoại</th>
              <th className="p-4 text-center">Vai trò (Role)</th>
              <th className="p-4">Cơ sở (Nếu là Business)</th>
              <th className="p-4">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-beige/40">
                <td className="p-4">
                  <p className="font-extrabold text-ink text-sm">{u.name}</p>
                  <p className="text-[10px] text-ink/40 font-mono mt-0.5">{u.id}</p>
                </td>
                <td className="p-4 font-medium text-ink/80">{u.email}</td>
                <td className="p-4 font-mono text-ink/70">{u.phone || "---"}</td>
                <td className="p-4 text-center">{getRoleBadge(u.role)}</td>
                <td className="p-4 font-mono text-[11px] text-forest font-bold">
                  {u.businessId || "Toàn sàn"}
                </td>
                <td className="p-4 text-ink/60">{u.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
