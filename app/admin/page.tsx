"use client";

import React, { useState, useEffect, useMemo } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api";
import { User, AdminExecutionLog } from "@/lib/types";
import {
  Shield,
  Users,
  Activity,
  Search,
  UserCheck,
  UserX,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  X,
  Filter,
  Layers,
  Terminal,
} from "lucide-react";

export default function AdminPage() {
  const { user: currentUser } = useAuth();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"operators" | "audit">("operators");

  // Operators state (FEAT-16 & FEAT-18)
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>("");
  const [modalAction, setModalAction] = useState<{
    type: "suspend" | "activate" | "delete";
    targetUser: User;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // System audit logs state (FEAT-17)
  const [logs, setLogs] = useState<AdminExecutionLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
  const [filterTool, setFilterTool] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterOperator, setFilterOperator] = useState<string>("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load operators on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load audit logs when switching to audit tab
  useEffect(() => {
    if (activeTab === "audit") {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await apiClient.get<User[]>("/admin/users");
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setActionNotice({ text: err?.message || "Failed to load users.", type: "error" });
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      let queryParams: string[] = [];
      if (filterTool) queryParams.push(`tool_name=${encodeURIComponent(filterTool)}`);
      if (filterStatus) queryParams.push(`status=${encodeURIComponent(filterStatus)}`);
      if (filterOperator) queryParams.push(`user_id=${encodeURIComponent(filterOperator)}`);

      const queryStr = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      const data = await apiClient.get<AdminExecutionLog[]>(`/admin/execution-logs${queryStr}`);
      setLogs(data);
    } catch (err: any) {
      console.error("Failed to load execution logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Filtered operators
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users, userSearch]);

  // Execute operator action (suspend / activate / delete)
  const handleConfirmAction = async () => {
    if (!modalAction) return;
    const { type, targetUser } = modalAction;
    setActionLoading(true);
    setActionNotice(null);

    try {
      if (type === "suspend" || type === "activate") {
        const updated = await apiClient.patch<User>(`/admin/users/${targetUser.id}/suspend`);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setActionNotice({
          text: `Account for ${targetUser.name} (${targetUser.email}) successfully ${updated.is_active ? "reactivated" : "suspended"}.`,
          type: "success",
        });
      } else if (type === "delete") {
        await apiClient.delete(`/admin/users/${targetUser.id}`);
        setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
        setActionNotice({
          text: `Operator ${targetUser.name} (${targetUser.email}) permanently deleted.`,
          type: "success",
        });
      }
      setModalAction(null);
    } catch (err: any) {
      setActionNotice({ text: err?.message || "Operation failed.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyJson = (id: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Summary statistics
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.is_active).length;
  const suspendedCount = users.filter((u) => !u.is_active).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "executed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            ✓ Executed
          </span>
        );
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            ⚠️ Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            ✕ Rejected
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200">
            ✕ Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header & Stats Banner */}
          <div className="rounded-2xl border border-purple-200/80 bg-white p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-2xs">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Admin Control Center</h1>
                  <p className="text-xs text-slate-500">
                    Administrator: <strong className="text-purple-700">{currentUser?.name}</strong> ({currentUser?.email})
                  </p>
                </div>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center">
                  <span className="block text-xs font-medium text-slate-400">Total Users</span>
                  <span className="text-lg font-bold text-slate-800">{totalUsers}</span>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
                  <span className="block text-xs font-medium text-emerald-600">Active</span>
                  <span className="text-lg font-bold text-emerald-700">{activeCount}</span>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-center">
                  <span className="block text-xs font-medium text-rose-600">Suspended</span>
                  <span className="text-lg font-bold text-rose-700">{suspendedCount}</span>
                </div>
              </div>
            </div>

            {/* Notification Notice Banner */}
            {actionNotice && (
              <div
                className={`mt-4 flex items-center justify-between rounded-xl p-3 text-xs ${
                  actionNotice.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                <span>{actionNotice.text}</span>
                <button
                  onClick={() => setActionNotice(null)}
                  className="text-slate-400 hover:text-slate-700 ml-2"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 space-x-4">
            <button
              onClick={() => setActiveTab("operators")}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "operators"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Operators & Access Control (FEAT-16, 18)</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === "audit"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>System Audit Logs (FEAT-17)</span>
            </button>
          </div>

          {/* TAB 1: OPERATORS & ACCESS CONTROL */}
          {activeTab === "operators" && (
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              {/* Search Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search operators by name or email…"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingUsers ? "animate-spin" : ""}`} />
                  <span>Refresh List</span>
                </button>
              </div>

              {/* Operators Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Operator</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Joined Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mb-2" />
                          <p>Loading operators…</p>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          No operators matching "{userSearch}".
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelf = u.id === currentUser?.id;
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                            {/* Operator Name & Email */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-xs uppercase shadow-2xs">
                                  {u.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{u.name}</div>
                                  <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  u.role === "admin"
                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                    : "bg-blue-100 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-3.5">
                              {u.is_active ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  Suspended
                                </span>
                              )}
                            </td>

                            {/* Joined Date */}
                            <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px]">
                              {new Date(u.created_at).toLocaleDateString([], {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>

                            {/* Actions (FEAT-18 with Self-Protection) */}
                            <td className="px-5 py-3.5 text-right">
                              {isSelf ? (
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-400">
                                  Self (Protected)
                                </span>
                              ) : (
                                <div className="inline-flex items-center gap-1.5">
                                  {/* Suspend / Reactivate Button */}
                                  <button
                                    onClick={() =>
                                      setModalAction({
                                        type: u.is_active ? "suspend" : "activate",
                                        targetUser: u,
                                      })
                                    }
                                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                      u.is_active
                                        ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                                    }`}
                                    title={u.is_active ? "Suspend Account" : "Reactivate Account"}
                                  >
                                    {u.is_active ? (
                                      <>
                                        <UserX className="h-3 w-3 text-amber-600" /> Suspend
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-3 w-3 text-emerald-600" /> Activate
                                      </>
                                    )}
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    onClick={() =>
                                      setModalAction({
                                        type: "delete",
                                        targetUser: u,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                                    title="Permanently Delete Operator"
                                  >
                                    <Trash2 className="h-3 w-3 text-rose-600" /> Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM AUDIT LOGS (FEAT-17) */}
          {activeTab === "audit" && (
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden space-y-0">
              {/* Filter Bar */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <div className="flex items-center gap-1 font-semibold text-slate-500">
                    <Filter className="h-3.5 w-3.5 text-purple-600" />
                    <span>Filters:</span>
                  </div>

                  {/* Tool filter */}
                  <select
                    value={filterTool}
                    onChange={(e) => setFilterTool(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="">All Tools</option>
                    <option value="find_customer">find_customer</option>
                    <option value="get_order">get_order</option>
                    <option value="get_order_history">get_order_history</option>
                    <option value="calculate_balance">calculate_balance</option>
                    <option value="apply_credit">apply_credit</option>
                    <option value="process_refund">process_refund</option>
                    <option value="cancel_order">cancel_order</option>
                    <option value="update_order_status">update_order_status</option>
                  </select>

                  {/* Status filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="">All Statuses</option>
                    <option value="executed">Executed</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="rejected">Rejected</option>
                    <option value="failed">Failed</option>
                  </select>

                  {/* Operator filter */}
                  <select
                    value={filterOperator}
                    onChange={(e) => setFilterOperator(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="">All Operators</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={loadAuditLogs}
                    className="rounded-xl bg-purple-600 px-3 py-1.5 font-semibold text-white hover:bg-purple-700 transition"
                  >
                    Apply Filter
                  </button>
                </div>

                <button
                  onClick={loadAuditLogs}
                  disabled={loadingLogs}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? "animate-spin" : ""}`} />
                  <span>Refresh Logs</span>
                </button>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Timestamp</th>
                      <th className="px-5 py-3">Operator</th>
                      <th className="px-5 py-3">Session Title</th>
                      <th className="px-5 py-3">Tool Name</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingLogs ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent mb-2" />
                          <p>Loading audit logs…</p>
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No audit records found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => {
                        const isExpanded = expandedLogId === log.id;
                        return (
                          <React.Fragment key={log.id}>
                            <tr className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-5 py-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                                {new Date(log.created_at).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                {new Date(log.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </td>

                              <td className="px-5 py-3.5">
                                <div className="font-medium text-slate-800">{log.user_name || "Unknown"}</div>
                                <div className="font-mono text-[10px] text-slate-400">{log.user_email || "–"}</div>
                              </td>

                              <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate font-medium">
                                {log.conversation_title || "Untitled Session"}
                              </td>

                              <td className="px-5 py-3.5">
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                  <Terminal className="h-3 w-3 text-purple-600" />
                                  {log.tool_name}
                                </span>
                              </td>

                              <td className="px-5 py-3.5">{getStatusBadge(log.status)}</td>

                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronDown className="h-3 w-3" /> Hide
                                    </>
                                  ) : (
                                    <>
                                      <ChevronRight className="h-3 w-3" /> Inspect
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>

                            {/* Expandable JSON Payload Row */}
                            {isExpanded && (
                              <tr className="bg-slate-50/90">
                                <td colSpan={6} className="px-6 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Tool Input */}
                                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                          Tool Input (Arguments)
                                        </span>
                                        <button
                                          onClick={() => handleCopyJson(`${log.id}-in`, log.tool_input)}
                                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-700"
                                        >
                                          {copiedId === `${log.id}-in` ? (
                                            <>
                                              <Check className="h-3 w-3 text-emerald-600" /> Copied
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="h-3 w-3" /> Copy
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-2.5 text-[11px] font-mono text-slate-200 max-h-48">
                                        {JSON.stringify(log.tool_input, null, 2)}
                                      </pre>
                                    </div>

                                    {/* Tool Output */}
                                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                          Tool Output (Result)
                                        </span>
                                        <button
                                          onClick={() => handleCopyJson(`${log.id}-out`, log.tool_output)}
                                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-700"
                                        >
                                          {copiedId === `${log.id}-out` ? (
                                            <>
                                              <Check className="h-3 w-3 text-emerald-600" /> Copied
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="h-3 w-3" /> Copy
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-2.5 text-[11px] font-mono text-slate-200 max-h-48">
                                        {JSON.stringify(log.tool_output, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Confirmation Modal (FEAT-18) */}
        {modalAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    modalAction.type === "delete"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {modalAction.type === "delete"
                      ? "Permanently Delete Operator"
                      : modalAction.type === "suspend"
                      ? "Suspend Operator Account"
                      : "Reactivate Operator Account"}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {modalAction.targetUser.email}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed my-4">
                {modalAction.type === "delete" ? (
                  <>
                    Are you sure you want to delete operator{" "}
                    <strong>{modalAction.targetUser.name}</strong>? This action is{" "}
                    <span className="text-rose-600 font-bold">irreversible</span> and will cascade
                    delete all conversations, messages, and associated execution logs.
                  </>
                ) : modalAction.type === "suspend" ? (
                  <>
                    Suspend operator <strong>{modalAction.targetUser.name}</strong>? They will be
                    immediately logged out and prohibited from creating or resuming conversations.
                  </>
                ) : (
                  <>
                    Reactivate operator <strong>{modalAction.targetUser.name}</strong>? Their login
                    access to the operations workspace will be immediately restored.
                  </>
                )}
              </p>

              <div className="flex items-center justify-end gap-2.5 mt-5">
                <button
                  onClick={() => setModalAction(null)}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={actionLoading}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition ${
                    modalAction.type === "delete"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : modalAction.type === "suspend"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {actionLoading ? "Processing…" : "Confirm Action"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
