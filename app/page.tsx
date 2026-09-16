"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Bot, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 mb-6 shadow-2xs">
          <Zap className="h-3.5 w-3.5 text-blue-600" />
          <span>Next-Gen Enterprise AI Operations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-5 max-w-3xl leading-tight">
          Safe, Autonomous Operations <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            With Human Oversight
          </span>
        </h1>

        <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mb-8 leading-relaxed">
          An enterprise-grade support and back-office operations console. Read operations run autonomously; sensitive financial adjustments and order mutations are strictly guarded by human-in-the-loop approvals.
        </p>

        {user ? (
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center mb-16">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer"
            >
              <span>Launch Operations Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-300 bg-purple-50/80 px-6 py-3.5 text-xs sm:text-sm font-bold text-purple-700 hover:bg-purple-100 shadow-2xs transition cursor-pointer"
              >
                <span>Admin Control Center</span>
                <ShieldCheck className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center mb-16">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer"
            >
              <span>Sign In to Console</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
            >
              Register Operator
            </Link>
          </div>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left w-full mt-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold mb-3 border border-blue-100">
              <Bot className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Autonomous Read Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant customer lookup, order tracking, and ledger balance queries executed in sub-second latency.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold mb-3 border border-amber-100">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Zero-Mutation HITL Buffer</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Order cancellations, credits, and refunds cannot touch the database without explicit human approval.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-bold mb-3 border border-purple-100">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Enterprise Audit Stream</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Step-by-step execution drawer, input/output JSON inspector, and multi-operator audit logs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
