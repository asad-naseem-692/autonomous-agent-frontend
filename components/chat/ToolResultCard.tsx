"use client";

import React, { useState } from "react";
import {
  UserSearch,
  Package,
  History,
  Calculator,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ExecutionLog } from "@/lib/types";

interface ToolResultCardProps {
  log: ExecutionLog;
}

export default function ToolResultCard({ log }: ToolResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
            <Check className="h-3 w-3" /> {status}
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">
            <Truck className="h-3 w-3" /> {status}
          </span>
        );
      case "pending":
      case "processing":
      case "due":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
            <Clock className="h-3 w-3" /> {status}
          </span>
        );
      case "cancelled":
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
            <XCircle className="h-3 w-3" /> {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {status}
          </span>
        );
    }
  };

  const renderToolContent = () => {
    const output: any = log.tool_output;
    if (!output) {
      return <p className="text-xs text-slate-500 italic">No output recorded</p>;
    }

    if (log.tool_name === "find_customer") {
      const customers = Array.isArray(output) ? output : [output];
      return (
        <div className="space-y-2">
          {customers.map((c, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                  {c.name ? c.name.charAt(0) : "C"}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs">{c.name}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{c.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  ID: {c.id}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs">
                  Available Credit: ${c.balance?.toFixed(2) ?? "0.00"}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (log.tool_name === "get_order") {
      const order = typeof output === "object" ? output : {};
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="rounded-lg bg-slate-50/70 p-2.5 border border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Order ID</span>
            <span className="font-bold font-mono text-slate-900 text-xs mt-0.5 block">{order.id}</span>
          </div>
          <div className="rounded-lg bg-slate-50/70 p-2.5 border border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer ID</span>
            <span className="font-semibold font-mono text-slate-700 text-xs truncate mt-0.5 block">{order.customer_id}</span>
          </div>
          <div className="rounded-lg bg-slate-50/70 p-2.5 border border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Fulfillment Status</span>
            <div className="mt-1">{getStatusBadge(order.status)}</div>
          </div>
          <div className="rounded-lg bg-slate-50/70 p-2.5 border border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Value</span>
            <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">${order.amount?.toFixed(2)}</span>
          </div>
        </div>
      );
    }

    if (log.tool_name === "get_order_history") {
      const orders = Array.isArray(output.orders) ? output.orders : [];
      return (
        <div className="space-y-2.5">
          <div className="text-xs text-slate-600 flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5">
              <span>Customer:</span>
              <strong className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded">{output.customer_id}</strong>
            </span>
            <span>Total Orders: <strong className="text-slate-900 font-bold">{orders.length}</strong></span>
          </div>
          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-3 text-center bg-white rounded-xl border border-slate-100">No historical orders found.</p>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              {orders.map((ord: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                    {getStatusBadge(ord.status)}
                  </div>
                  <div className="flex items-center gap-3">
                    {ord.created_at && (
                      <span className="text-slate-400 hidden sm:inline font-mono text-[11px]">
                        {new Date(ord.created_at).toLocaleDateString()}
                      </span>
                    )}
                    <span className="font-bold text-slate-900 text-sm">${ord.amount?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (log.tool_name === "calculate_balance") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <div className="rounded-lg bg-slate-50/70 p-2.5 border border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">{output.customer_name || output.customer_id}</span>
          </div>
          <div className="rounded-lg bg-slate-50/70 p-2.5 border border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Store Credit</span>
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">${output.credit_balance?.toFixed(2)}</span>
          </div>
          <div className="rounded-lg bg-slate-50/70 p-2.5 border border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Unpaid Dues</span>
            <span className="font-bold text-amber-700 text-sm mt-0.5 block">${output.unpaid_orders_amount?.toFixed(2)}</span>
          </div>
          <div className="rounded-lg bg-slate-50/70 p-2.5 border border-slate-100">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Net Balance</span>
            <span
              className={`font-extrabold text-sm mt-0.5 block ${
                (output.net_balance ?? 0) >= 0 ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              ${output.net_balance?.toFixed(2)}
            </span>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <pre className="max-h-40 overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] text-slate-200 border border-slate-800">
        {JSON.stringify(output, null, 2)}
      </pre>
    );
  };

  const getToolMeta = () => {
    switch (log.tool_name) {
      case "find_customer":
        return {
          icon: <UserSearch className="h-4 w-4 text-indigo-600" />,
          title: "Customer Lookup",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "get_order":
        return {
          icon: <Package className="h-4 w-4 text-blue-600" />,
          title: "Order Details",
          badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "get_order_history":
        return {
          icon: <History className="h-4 w-4 text-purple-600" />,
          title: "Order History",
          badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "calculate_balance":
        return {
          icon: <Calculator className="h-4 w-4 text-emerald-600" />,
          title: "Balance Calculation",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      default:
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-slate-600" />,
          title: log.tool_name,
          badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  const meta = getToolMeta();

  return (
    <div className="my-2.5 max-w-2xl rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs hover:border-slate-300 transition-all">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between gap-2 select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-2xs border border-slate-200">
            {meta.icon}
          </div>
          <span className="text-xs font-bold text-slate-900">{meta.title}</span>
          <span className={`rounded-md border px-1.5 py-0.2 text-[10px] font-mono font-medium ${meta.badgeColor}`}>
            {log.tool_name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 hover:text-slate-600">
          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Executed
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {isExpanded && <div className="mt-3 pt-2.5 border-t border-slate-200/80">{renderToolContent()}</div>}
    </div>
  );
}
