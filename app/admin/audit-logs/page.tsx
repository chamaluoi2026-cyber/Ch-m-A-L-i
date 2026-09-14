"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Shield,
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Lock,
  Layers
} from "lucide-react";
import { fetchAllAuditLogsAction } from "@/app/actions/audit";
import type { AuditLogRecord } from "@/lib/server-store";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAuditLogsAction({
        action: selectedAction,
        entityType: selectedEntity,
        search,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      });
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedEntity, selectedAction, dateFrom, dateTo]);

  // Unique actions and entities
  const entities = ["ALL", "PLACE", "BLOG", "LEAD", "BOOKING", "PAYMENT", "COMMISSION", "RECONCILIATION", "REVIEW", "USER"];
  const actions = ["ALL", "CREATE", "UPDATE", "DELETE", "PUBLISH", "UNPUBLISH", "APPROVE", "REJECT", "ASSIGN", "STATUS_CHANGE", "PAYMENT", "REFUND", "COMMISSION_CHANGE", "RECONCILE"];

  const getActionBadge = (action: string) => {
    const act = (action || "").toUpperCase();
    if (act.includes("CREATE") || act.includes("PUBLISH") || act.includes("APPROVE")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    if (act.includes("DELETE") || act.includes("REJECT") || act.includes("REFUND") || act.includes("CANCEL")) {
      return "bg-rose-100 text-rose-800 border-rose-300";
    }
    if (act.includes("COMMISSION") || act.includes("RECONCILE") || act.includes("PAYMENT")) {
      return "bg-amber-100 text-amber-800 border-amber-300";
    }
    if (act.includes("ASSIGN") || act.includes("STATUS")) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  const getEntityIcon = (type: string) => {
    const t = (type || "").toUpperCase();
    switch (t) {
      case "PLACE":
        return <MapPin className="size-3.5 text-forest" />;
      case "BLOG":
        return <FileText className="size-3.5 text-amber-600" />;
      case "LEAD":
      case "BOOKING":
        return <Briefcase className="size-3.5 text-blue-600" />;
      case "PAYMENT":
      case "COMMISSION":
      case "RECONCILIATION":
        return <DollarSign className="size-3.5 text-emerald-600" />;
      default:
        return <Shield className="size-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-ink">Nhật ký Kiểm toán Hệ thống (Audit Logs)</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 border border-forest/20 px-2.5 py-0.5 text-[11px] font-bold text-forest">
              <Lock className="size-3" /> Bất biến (Append-only)
            </span>
          </div>
          <p className="text-xs text-ink/60 mt-1">
            Ghi nhận toàn bộ thao tác quan trọng trên Place, Blog, Lead, Booking, Payment, Commission & Users.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-white border border-black/10 px-4 py-2 text-xs font-bold text-ink hover:bg-forest/5 hover:border-forest transition shadow-sm"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-forest" : ""}`} />
            Làm mới
          </button>
          <div className="rounded-2xl bg-forest/10 px-4 py-2 text-xs font-bold text-forest">
            {logs.length} bản ghi
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl bg-white p-4 shadow-card border border-black/5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadLogs()}
            placeholder="Tìm theo ID, tên đối tượng, người thực hiện..."
            className="w-full rounded-2xl border border-black/10 pl-10 pr-4 py-2.5 text-xs text-ink placeholder:text-ink/40 focus:border-forest focus:outline-none"
          />
        </div>

        {/* Entity Type Filter */}
        <div>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="w-full rounded-2xl border border-black/10 px-3.5 py-2.5 text-xs text-ink focus:border-forest focus:outline-none"
          >
            {entities.map((ent) => (
              <option key={ent} value={ent.toLowerCase()}>
                {ent === "ALL" ? "Tất cả đối tượng (Entity)" : `Đối tượng: ${ent}`}
              </option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full rounded-2xl border border-black/10 px-3.5 py-2.5 text-xs text-ink focus:border-forest focus:outline-none"
          >
            {actions.map((act) => (
              <option key={act} value={act.toLowerCase()}>
                {act === "ALL" ? "Tất cả hành động (Action)" : `Hành động: ${act}`}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-1/2 rounded-2xl border border-black/10 px-3 py-2 text-xs text-ink focus:border-forest focus:outline-none"
          />
          <span className="text-ink/40 text-xs">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-1/2 rounded-2xl border border-black/10 px-3 py-2 text-xs text-ink focus:border-forest focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
              <tr>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Người thực hiện (Actor)</th>
                <th className="p-4">Hành động (Action)</th>
                <th className="p-4">Đối tượng (Entity)</th>
                <th className="p-4">Tóm tắt thao tác</th>
                <th className="p-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink/50">
                    Đang nạp nhật ký kiểm toán...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink/50">
                    Không tìm thấy bản ghi kiểm toán phù hợp.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-beige/40 transition">
                    <td className="p-4 whitespace-nowrap text-ink/70 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString("vi-VN")}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-ink">{log.actorName || "Hệ thống"}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/5 text-ink/60">
                          {log.actorRole || "ADMIN"}
                        </span>
                        <span className="text-[10px] text-ink/40 font-mono">({log.actorId})</span>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-ink">
                        {getEntityIcon(log.entityType)}
                        <span>{log.entityType}</span>
                      </div>
                      <p className="text-[11px] text-forest font-semibold mt-0.5 truncate max-w-[200px]" title={log.entityTitle}>
                        {log.entityTitle || log.entityId}
                      </p>
                      <p className="text-[10px] font-mono text-ink/40">{log.entityId}</p>
                    </td>

                    <td className="p-4 max-w-md">
                      <p className="text-ink/80 text-xs leading-relaxed font-medium">{log.summary}</p>
                      {log.reason && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 rounded-lg px-2 py-0.5 mt-1 border border-amber-200 inline-block">
                          Lý do: {log.reason}
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 rounded-xl bg-forest/10 px-3 py-1.5 text-xs font-bold text-forest hover:bg-forest hover:text-white transition"
                      >
                        <Eye className="size-3.5" /> Xem Diff
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diff / Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-black/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-forest" />
                <h3 className="font-extrabold text-lg text-ink">Chi Tiết Kiểm Toán</h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getActionBadge(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="size-8 rounded-full bg-black/5 flex items-center justify-center text-ink/60 hover:bg-black/10 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-[#F4F6F5] p-4">
                <div>
                  <p className="text-ink/50 text-[11px]">Mã sự kiện kiểm toán:</p>
                  <p className="font-mono font-bold text-ink mt-0.5">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-ink/50 text-[11px]">Thời gian:</p>
                  <p className="font-mono text-ink mt-0.5">{new Date(selectedLog.timestamp).toLocaleString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-ink/50 text-[11px]">Người thực hiện (Actor):</p>
                  <p className="font-bold text-ink mt-0.5">{selectedLog.actorName} ({selectedLog.actorRole})</p>
                  <p className="font-mono text-[10px] text-ink/40">{selectedLog.actorId}</p>
                </div>
                <div>
                  <p className="text-ink/50 text-[11px]">Địa chỉ IP & Môi trường:</p>
                  <p className="font-mono text-ink mt-0.5">{selectedLog.ip || "127.0.0.1"}</p>
                  <p className="text-[10px] text-ink/40 truncate">{selectedLog.userAgent}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-ink mb-1">Mô tả tóm tắt:</p>
                <p className="p-3 rounded-xl bg-forest/5 text-forest font-semibold border border-forest/20">
                  {selectedLog.summary}
                </p>
              </div>

              {selectedLog.reason && (
                <div>
                  <p className="font-bold text-ink mb-1">Lý do điều chỉnh:</p>
                  <p className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                    {selectedLog.reason}
                  </p>
                </div>
              )}

              {/* Diff Viewer (oldValue -> newValue) */}
              {(selectedLog.oldValue || selectedLog.newValue) && (
                <div className="pt-2">
                  <p className="font-bold text-ink mb-2">So sánh thay đổi (Value Difference):</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3.5">
                      <p className="font-bold text-rose-800 mb-1.5 flex items-center gap-1">
                        <span className="size-2 rounded-full bg-rose-600" /> Giá trị trước thay đổi (Old Value)
                      </p>
                      <pre className="text-[11px] font-mono text-rose-950 bg-white/80 p-2.5 rounded-xl overflow-x-auto max-h-48 border border-rose-100">
                        {JSON.stringify(selectedLog.oldValue, null, 2) || "null"}
                      </pre>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                      <p className="font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                        <span className="size-2 rounded-full bg-emerald-600" /> Giá trị mới cập nhật (New Value)
                      </p>
                      <pre className="text-[11px] font-mono text-emerald-950 bg-white/80 p-2.5 rounded-xl overflow-x-auto max-h-48 border border-emerald-100">
                        {JSON.stringify(selectedLog.newValue, null, 2) || "null"}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-2xl bg-forest px-6 py-2.5 text-xs font-bold text-white hover:bg-forest/90 transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
