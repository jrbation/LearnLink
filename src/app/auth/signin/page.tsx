"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { signInSchema } from "@/lib/validations";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      // Fetch session to get role for redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role) {
        const dashboardPaths: Record<string, string> = {
          TEACHER: "/dashboard/teacher",
          STUDENT: "/dashboard/student",
          PARENT: "/dashboard/parent",
        };
        router.push(dashboardPaths[session.user.role] || "/dashboard");
        router.refresh();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
      <p className="text-slate-500 mb-8">Sign in to your LearnLink account</p>

      {registered && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Account created successfully! Please sign in.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="label mb-0">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-primary-600 font-medium hover:text-primary-700">
          Create one
        </Link>
      </p>

      {/* Demo Accounts */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center mb-3">Demo Accounts (password: Demo1234!)</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Teacher", email: "teacher@learnlink.demo" },
            { label: "Student", email: "student@learnlink.demo" },
            { label: "Parent", email: "parent@learnlink.demo" },
          ].map((demo) => (
            <button
              key={demo.label}
              type="button"
              onClick={() => {
                setEmail(demo.email);
                setPassword("Demo1234!");
              }}
              className="p-2 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all text-center"
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading sign in...</div>}>
      <SignInForm />
    </Suspense>
  );
}
