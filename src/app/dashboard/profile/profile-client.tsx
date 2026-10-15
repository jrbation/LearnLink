"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  CheckCircle2,
  Save,
  Sparkles,
} from "lucide-react";

interface Props {
  user: any;
}

export function ProfileClient({ user }: Props) {
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    bio: user.bio || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-primary-600" />
            Profile & Account Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your personal details, contact information, and account preferences.
          </p>
        </div>
        <span className="badge badge-primary text-xs font-bold px-3 py-1">
          {user.role}
        </span>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-semibold">
          {error}
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-accent text-white font-bold text-xl flex items-center justify-center shadow-xs">
            {formData.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{formData.name}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full text-sm py-2.5 px-3 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (Login Identity)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="input-field w-full text-sm py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Contact administrator to modify registered email address.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +1 (555) 000-0000"
              className="input-field w-full text-sm py-2.5 px-3 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Biography / Intro
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief professional background, teaching philosophy, or student goals..."
              className="input-field w-full text-sm py-2.5 px-3 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
