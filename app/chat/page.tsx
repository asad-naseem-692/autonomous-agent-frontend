"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();

  return (
    <AuthGuard allowedRoles={["operator", "admin"]}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {user?.name}!
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
              You are signed in as an <span className="font-semibold">{user?.role}</span>. The agent conversation interface will be active here in Module 2.
            </p>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
