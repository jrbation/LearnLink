"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-accent rounded-xl flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              Learn<span className="text-primary-600">Link</span>
            </span>
          </Link>
          <Link href="/" className="btn btn-secondary btn-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16 sm:px-6">
        <div className="text-center mb-10 animate-fade-in">
          <span className="badge badge-primary mb-3">Support & Feedback</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            Get in Touch with Us
          </h1>
          <p className="text-sm text-slate-500">
            Have questions about LearnLink or need school administration onboarding? We&apos;re here to assist.
          </p>
        </div>

        <div className="card p-8 animate-fade-in">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Message Received</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Thank you, {name}! Our educational support coordinators will respond to {email} shortly.
              </p>
              <Link href="/" className="btn btn-primary btn-sm">
                Return to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Your Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.org"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Topic / Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Teacher Onboarding, Parent Account Link assistance"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our educational support team help you?"
                  className="input"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                <Send className="w-4 h-4" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
