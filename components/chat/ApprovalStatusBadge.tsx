"use client";

import { ApprovalRequest } from "@/lib/types";

import { Clock, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  status: ApprovalRequest["status"];
}

export default function ApprovalStatusBadge({ status }: Props) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        Pending Authorization
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        Authorized & Executed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
      <XCircle className="h-3.5 w-3.5 text-rose-600" />
      Rejected & Aborted
    </span>
  );
}
