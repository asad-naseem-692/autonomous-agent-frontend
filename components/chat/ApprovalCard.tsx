"use client";

import { useState, useCallback } from "react";
import { ApprovalRequest } from "@/lib/types";
import { apiClient } from "@/lib/api";
import ApprovalStatusBadge from "./ApprovalStatusBadge";

interface Props {
  approval: ApprovalRequest;
  onResolved?: (updated: ApprovalRequest) => void;
}

const ACTION_LABELS: Record<string, string> = {
  apply_credit: "Apply Credit",
  process_refund: "Process Refund",
  cancel_order: "Cancel Order",
  update_order_status: "Update Order Status",
};

const PARAM_LABELS: Record<string, string> = {
  customer_id: "Customer ID",
  amount: "Amount (USD)",
  reason: "Reason",
  order_id: "Order ID",
  new_status: "New Status",
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
    <div className={
      `rounded-xl border-2 p-4 my-2 shadow-sm transition-all ${
        approval.status === "pending"
          ? "border-amber-400 bg-amber-50"
          : approval.status === "approved"
          ? "border-green-400 bg-green-50"
          : "border-red-300 bg-red-50"
      }`
    }>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {approval.status === "pending" ? "⚠️" : approval.status === "approved" ? "✅" : "❌"}
          </span>
          <span className="font-semibold text-sm text-gray-800">
            Action Requires Approval: <span className="text-gray-900">{actionLabel}</span>
          </span>
        </div>
        <ApprovalStatusBadge status={approval.status} />
      </div>

      {/* Parameters */}
      <div className="bg-white/70 rounded-lg p-3 mb-3 border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Parameters</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(approval.tool_input).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-xs text-gray-500">{PARAM_LABELS[k] ?? k}:</dt>
              <dd className="text-xs font-mono font-medium text-gray-800">
                {typeof v === "number" && k === "amount" ? `$${v.toFixed(2)}` : String(v)}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Result message after resolution */}
      {resultMessage && (
        <p className="text-xs text-gray-700 bg-white/60 rounded p-2 mb-3 border border-gray-200">
          {resultMessage}
        </p>
      )}

      {/* Action buttons — only shown while pending */}
      {isPending && (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction("approve")}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold transition-colors"
          >
            {loading === "approve" ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : "✓"}
            {loading === "approve" ? "Approving…" : "Approve"}
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold transition-colors"
          >
            {loading === "reject" ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : "✕"}
            {loading === "reject" ? "Rejecting…" : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}
