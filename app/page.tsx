"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Bot, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 mb-6">
          <Zap className="h-3.5 w-3.5" />
          <span>Next-Gen Autonomous Agent</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 max-w-2xl">
          Autonomous Business Operations Agent
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-xl mb-8">
          A secure operational copilot executing business queries and approval-gated sensitive actions with comprehensive audit trails.
        </p>

        {user ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-300 bg-purple-50 px-6 py-3 text-sm font-semibold text-purple-700 hover:bg-purple-100 shadow-sm transition"
              >
                <span>Admin Panel</span>
                <ShieldCheck className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition"
            >
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              Create Account
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
