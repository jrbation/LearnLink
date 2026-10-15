"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, School, GraduationCap, Users } from "lucide-react";
import { signUpSchema, type SignUpInput } from "@/lib/validations";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<SignUpInput>>({
    role: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const selectRole = (role: "TEACHER" | "STUDENT" | "PARENT") => {
    setFormData((prev) => ({ ...prev, role }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Something went wrong");
        return;
      }

      router.push("/auth/signin?registered=true");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "TEACHER" as const, icon: School, label: "Teacher", desc: "Manage classes & students" },
    { value: "STUDENT" as const, icon: GraduationCap, label: "Student", desc: "Learn & submit work" },
    { value: "PARENT" as const, icon: Users, label: "Parent", desc: "Monitor your child" },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
      <p className="text-slate-500 mb-8">Join LearnLink to get started</p>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 mb-6">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role Selection */}
        <div>
          <label className="label">I am a...</label>
          <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => selectRole(role.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  formData.role === role.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 hover:border-primary-200"
                }`}
              >
                <role.icon
                  className={`w-6 h-6 mx-auto mb-1.5 ${
                    formData.role === role.value ? "text-primary-600" : "text-slate-400"
                  }`}
                />
                <div className={`text-sm font-medium ${
                  formData.role === role.value ? "text-primary-700" : "text-slate-700"
                }`}>
                  {role.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{role.desc}</div>
              </button>
            ))}
          </div>
          {errors.role && <p className="error-text">{errors.role}</p>}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="label">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name || ""}
            onChange={handleChange}
            className={`input ${errors.name ? "input-error" : ""}`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="label">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleChange}
            className={`input ${errors.email ? "input-error" : ""}`}
            placeholder="you@example.com"
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password || ""}
              onChange={handleChange}
              className={`input pr-10 ${errors.password ? "input-error" : ""}`}
              placeholder="Min 8 characters"
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
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="label">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword || ""}
            onChange={handleChange}
            className={`input ${errors.confirmPassword ? "input-error" : ""}`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-primary-600 font-medium hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
