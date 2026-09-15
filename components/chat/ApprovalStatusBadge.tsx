"use client";

import { ApprovalRequest } from "@/lib/types";

interface Props {
  status: ApprovalRequest["status"];
}

export default function ApprovalStatusBadge({ status }: Props) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Pending
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Rejected
    </span>
  );
}
