"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to process request");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Link
        href="/auth/signin"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to sign in
      </Link>

      <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset your password</h2>
      <p className="text-slate-500 text-sm mb-8">
        Enter your registered email address and we will provide password reset instructions.
      </p>

      {submitted ? (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm mb-1">Reset Link Dispatched</h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            If an account exists for <span className="font-medium text-slate-800">{email}</span>, you will receive password reset instructions.
          </p>
          <Link href="/auth/signin" className="btn btn-primary btn-sm">
            Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">Registered Email</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="you@example.com"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
