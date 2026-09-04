"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token.trim()) {
      setError("No reset token found in URL. Please request a new password reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiClient<{ message: string }>("/auth/confirm-reset", {
        method: "POST",
        body: JSON.stringify({
          token: token.trim(),
          new_password: password,
        }),
        skipAuth: true,
      });

      setSuccess(data.message);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to reset password. The link may be expired or invalid.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
      <div className="text-center mb-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Set New Password
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Create a secure password for your account
        </p>
      </div>

      {!token && (
        <div className="mb-6 rounded-lg bg-amber-50 p-4 text-xs text-amber-800 border border-amber-200">
          Missing reset token in link. Please use the link provided in your email or{" "}
          <Link href="/forgot-password" className="underline font-medium text-amber-900">
            request a new reset link
          </Link>.
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
          <span>{success} Redirecting to sign in...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !token}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60 transition mt-2"
        >
          {isSubmitting ? "Resetting Password..." : "Update Password"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-slate-50">
      <Suspense fallback={<div className="text-sm text-slate-500">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

