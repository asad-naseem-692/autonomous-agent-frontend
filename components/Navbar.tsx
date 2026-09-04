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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-semibold text-slate-900 text-base sm:text-lg">
            OpsAgent
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 sm:gap-2 mr-2">
              <Link
                href="/chat"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Workspace</span>
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {user.name}
                </p>
                <span
                  className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wider ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-red-600 transition"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
