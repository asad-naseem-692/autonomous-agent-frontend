"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, LogOut, Shield, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-base sm:text-lg">
              OpsAgent
            </span>
          </Link>
        </div>

        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/chat"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline">Workspace</span>
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50/80 hover:bg-purple-100 border border-purple-200/60 transition shadow-2xs"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin Center</span>
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-white text-xs font-bold shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user.name || user.email}
                  </p>
                  <span
                    className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded-md uppercase tracking-wider border ${
                      user.role === "admin"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-2xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/25 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
