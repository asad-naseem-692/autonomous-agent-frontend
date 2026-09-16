"use client";

import React, { useState } from "react";
import {
  X,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Calendar,
  Layers,
} from "lucide-react";
import { ExecutionLog } from "@/lib/types";

interface ExecutionTraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ExecutionLog[];
  conversationTitle?: string;
  isLoading?: boolean;
}

export default function ExecutionTraceDrawer({
  isOpen,
  onClose,
  logs,
  conversationTitle = "Active Session",
  isLoading = false,
}: ExecutionTraceDrawerProps) {
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (id: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: ExecutionLog["status"]) => {
    switch (status) {
      case "executed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> Executed
          </span>
        );
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" /> Pending Approval
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200">
            <AlertCircle className="h-3 w-3" /> Failed
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

  const formatTimestamp = (ts?: string) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return ts;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Execution Trace</h2>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  {logs.length} {logs.length === 1 ? "Step" : "Steps"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-sm">
                {conversationTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            title="Close Trace Drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Trace Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs">Loading execution timeline…</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">No Tool Executions Recorded</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  When the agent invokes read or write tools in this conversation, each step and payload will appear here in chronological order.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {logs.map((log, index) => {
                const isExpanded = expandedLogs[log.id] ?? false;
                return (
                  <div key={log.id} className="relative">
                    {/* Step Node Dot */}
                    <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-blue-600 text-[10px] font-bold text-blue-700 shadow-2xs">
                      {index + 1}
                    </div>

                    {/* Step Card */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300">
                      {/* Step Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="h-3.5 w-3.5 text-blue-600" />
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {log.tool_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(log.status)}
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {formatTimestamp(log.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Summary / Snippet */}
                      <div className="text-xs text-slate-600 mb-2">
                        {log.tool_name === "find_customer" && (
                          <span>Queried: <strong className="font-mono text-slate-900">{String(log.tool_input?.query || "")}</strong></span>
                        )}
                        {log.tool_name === "get_order" && (
                          <span>Order lookup: <strong className="font-mono text-slate-900">{String(log.tool_input?.order_id || "")}</strong></span>
                        )}
                        {log.tool_name === "get_order_history" && (
                          <span>Order history for: <strong className="font-mono text-slate-900">{String(log.tool_input?.customer_id || "")}</strong></span>
                        )}
                        {log.tool_name === "calculate_balance" && (
                          <span>Balance calculation for: <strong className="font-mono text-slate-900">{String(log.tool_input?.customer_id || "")}</strong></span>
                        )}
                        {log.tool_name === "apply_credit" && (
                          <span>Credit <strong className="text-slate-900">${Number(log.tool_input?.amount || 0).toFixed(2)}</strong> to <strong className="font-mono text-slate-900">{String(log.tool_input?.customer_id || "")}</strong></span>
                        )}
                        {log.tool_name === "cancel_order" && (
                          <span>Cancel order: <strong className="font-mono text-slate-900">{String(log.tool_input?.order_id || "")}</strong></span>
                        )}
                        {log.tool_name === "process_refund" && (
                          <span>Refund <strong className="text-slate-900">${Number(log.tool_input?.amount || 0).toFixed(2)}</strong> for order <strong className="font-mono text-slate-900">{String(log.tool_input?.order_id || "")}</strong></span>
                        )}
                        {log.tool_name === "update_order_status" && (
                          <span>Update order <strong className="font-mono text-slate-900">{String(log.tool_input?.order_id || "")}</strong> status to <strong className="text-slate-900">"{String(log.tool_input?.new_status || "")}"</strong></span>
                        )}
                      </div>

                      {/* Expand / Collapse Payload Details */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="flex w-full items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                        >
                          <span className="flex items-center gap-1">
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            {isExpanded ? "Hide Technical Payloads" : "Inspect Raw Input & Output"}
                          </span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {isExpanded ? "Collapse" : "JSON Details"}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 space-y-2 animate-in fade-in duration-150">
                            {/* Input Payload */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Tool Input (Arguments)
                                </span>
                                <button
                                  onClick={() => handleCopy(`${log.id}-in`, log.tool_input)}
                                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700"
                                >
                                  {copiedId === `${log.id}-in` ? (
                                    <><Check className="h-2.5 w-2.5 text-emerald-600" /> Copied</>
                                  ) : (
                                    <><Copy className="h-2.5 w-2.5" /> Copy</>
                                  )}
                                </button>
                              </div>
                              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-2.5 text-[11px] font-mono text-slate-200">
                                {JSON.stringify(log.tool_input, null, 2)}
                              </pre>
                            </div>

                            {/* Output Payload */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Tool Output (Result)
                                </span>
                                <button
                                  onClick={() => handleCopy(`${log.id}-out`, log.tool_output)}
                                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700"
                                >
                                  {copiedId === `${log.id}-out` ? (
                                    <><Check className="h-2.5 w-2.5 text-emerald-600" /> Copied</>
                                  ) : (
                                    <><Copy className="h-2.5 w-2.5" /> Copy</>
                                  )}
                                </button>
                              </div>
                              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-2.5 text-[11px] font-mono text-slate-200">
                                {JSON.stringify(log.tool_output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Execution Trace & History (Module 6)</span>
          <span className="font-mono text-[10px] text-slate-400">FEAT-15 / FEAT-25</span>
        </div>
      </div>
    </div>
  );
}
