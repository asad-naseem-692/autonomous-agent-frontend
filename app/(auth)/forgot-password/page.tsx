"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";

interface RequestResetResponse {
  message: string;
  reset_token?: string | null;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResetToken(null);

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await apiClient<RequestResetResponse>("/auth/request-reset", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
        skipAuth: true,
      });

      setSuccess(data.message);
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while requesting password reset.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Forgot Password
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2.5 font-medium text-emerald-900">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              <span>Reset link generated</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">{success}</p>

            {resetToken && (
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <p className="text-xs font-semibold text-emerald-900 mb-1.5">
                  Development / Demo Link:
                </p>
                <Link
                  href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 underline bg-white px-2.5 py-1.5 rounded border border-emerald-300"
                >
                  Click here to set a new password &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.com"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60 transition mt-2"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
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
    </div>
  );
}
