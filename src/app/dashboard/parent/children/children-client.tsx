"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  School,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface Props {
  initialLinks: any[];
}

export function ParentChildrenClient({ initialLinks }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [showModal, setShowModal] = useState(false);
  const [childEmail, setChildEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/parent/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to link child");

      setLinks([data.link, ...links]);
      setSuccess("Student successfully linked to your account!");
      setShowModal(false);
      setChildEmail("");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" />
            Connected Children Profiles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage linked student profiles to monitor their assignments, live lectures, and academic records.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Child</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {success}
        </div>
      )}

      {/* Children Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 font-bold text-base flex items-center justify-center">
                    {link.child.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{link.child.name}</h3>
                    <p className="text-xs text-slate-400">{link.child.email}</p>
                  </div>
                </div>
                <span className="badge badge-success text-[10px] font-bold">
                  {link.status}
                </span>
              </div>

              {/* Enrolled classes */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Enrolled Classes ({link.child.enrollments.length}):
                </span>

                {link.child.enrollments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Not enrolled in any classes yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {link.child.enrollments.map((enr: any) => (
                      <span
                        key={enr.class.id}
                        className="badge badge-primary text-[11px] font-semibold"
                      >
                        {enr.class.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Connected {new Date(link.linkedAt).toLocaleDateString()}
              </span>

              <Link
                href="/dashboard/parent"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Open Overview Dashboard
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Link Child Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                Connect Child Profile
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLinkChild} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student&apos;s Account Email *
                </label>
                <input
                  type="email"
                  required
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  placeholder="e.g. student@learnlink.demo"
                  className="input-field w-full text-sm py-2.5 px-3 rounded-xl border border-slate-200"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Enter the email address your child uses to log into LearnLink.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary px-4 py-2 text-xs font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !childEmail.trim()}
                  className="btn-primary px-5 py-2 text-xs font-medium rounded-xl shadow-xs"
                >
                  {isSubmitting ? "Connecting..." : "Connect Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
