"use client";

import { useState, useCallback } from "react";
import { ApprovalRequest } from "@/lib/types";
import { apiClient } from "@/lib/api";
import ApprovalStatusBadge from "./ApprovalStatusBadge";
import { ShieldAlert, Check, X, ArrowRight, ShieldCheck, AlertOctagon } from "lucide-react";

interface Props {
  approval: ApprovalRequest;
  onResolved?: (updated: ApprovalRequest) => void;
}

const ACTION_LABELS: Record<string, string> = {
  apply_credit: "Apply Store Credit",
  process_refund: "Process Order Refund",
  cancel_order: "Cancel Customer Order",
  update_order_status: "Update Order Fulfillment Status",
};

const PARAM_LABELS: Record<string, string> = {
  customer_id: "Customer ID",
  amount: "Authorized Amount",
  reason: "Justification Reason",
  order_id: "Target Order ID",
  new_status: "New Fulfillment Status",
};

export default function ApprovalCard({ approval: initialApproval, onResolved }: Props) {
  const [approval, setApproval] = useState<ApprovalRequest>(initialApproval);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleAction = useCallback(async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      const updated = await apiClient.post<ApprovalRequest>(
        `/approvals/${approval.id}/${action}`
      );
      setApproval(updated);
      setResultMessage(updated.message ?? null);
      onResolved?.(updated);
    } catch (err: any) {
      setResultMessage(`Error: ${err?.message ?? "Something went wrong"}`);
    } finally {
      setLoading(null);
    }
  }, [approval.id, onResolved]);

  const isPending = approval.status === "pending";
  const actionLabel = ACTION_LABELS[approval.tool_name] ?? approval.tool_name;

  return (
    <div
      className={`rounded-2xl border-2 p-4 sm:p-5 my-3 shadow-md transition-all ${
        approval.status === "pending"
          ? "border-amber-300/90 bg-gradient-to-b from-amber-50/80 to-white ring-4 ring-amber-400/10"
          : approval.status === "approved"
          ? "border-emerald-300/90 bg-gradient-to-b from-emerald-50/70 to-white ring-4 ring-emerald-500/10"
          : "border-rose-300/90 bg-gradient-to-b from-rose-50/70 to-white ring-4 ring-rose-500/10"
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-2xs ${
              approval.status === "pending"
                ? "bg-amber-500"
                : approval.status === "approved"
                ? "bg-emerald-600"
                : "bg-rose-600"
            }`}
          >
            {approval.status === "pending" ? (
              <ShieldAlert className="h-4 w-4" />
            ) : approval.status === "approved" ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <AlertOctagon className="h-4 w-4" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Human-in-the-Loop Security Guardrail
            </span>
            <span className="font-bold text-sm text-slate-900">
              {actionLabel}
            </span>
          </div>
        </div>
        <ApprovalStatusBadge status={approval.status} />
      </div>

      {/* Target Parameters Matrix */}
      <div className="my-3.5 rounded-xl border border-slate-200/80 bg-white/90 p-3.5 shadow-2xs">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <span>Action Parameters</span>
          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
          <span className="font-mono lowercase text-slate-400">tool: {approval.tool_name}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.entries(approval.tool_input).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-slate-50/80 px-3 py-2 border border-slate-100">
              <span className="text-[11px] text-slate-500 block font-medium">
                {PARAM_LABELS[k] ?? k}
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 break-all">
                {typeof v === "number" && k === "amount" ? (
                  <span className="text-emerald-700 font-extrabold text-sm">${v.toFixed(2)}</span>
                ) : (
                  String(v)
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Execution Resolution Notice */}
      {resultMessage && (
        <div
          className={`flex items-start gap-2 rounded-xl p-3 mb-3.5 text-xs font-medium border ${
            approval.status === "approved"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {approval.status === "approved" ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <X className="h-4 w-4 text-rose-600" />
            )}
          </div>
          <div className="flex-1">
            <span className="font-bold block mb-0.5">
              {approval.status === "approved" ? "Database Mutation Committed" : "Action Aborted"}
            </span>
            <span className="leading-relaxed">{resultMessage}</span>
          </div>
        </div>
      )}

      {/* Action Decision Buttons (Pending state only) */}
      {isPending && (
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            onClick={() => handleAction("approve")}
            disabled={loading !== null}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading === "approve" ? (
              <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span>{loading === "approve" ? "Committing Mutation..." : "Authorize & Execute"}</span>
          </button>

          <button
            onClick={() => handleAction("reject")}
            disabled={loading !== null}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-50 hover:border-rose-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading === "reject" ? (
              <span className="h-4 w-4 border-2 border-rose-600/40 border-t-rose-600 rounded-full animate-spin" />
            ) : (
              <X className="h-4 w-4 text-rose-600" />
            )}
            <span>{loading === "reject" ? "Aborting..." : "Reject & Keep Untouched"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
