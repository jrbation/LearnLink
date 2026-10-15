import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import {
  GraduationCap,
  ArrowLeft,
  School,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Calendar,
  Bell,
  UserCheck,
  Megaphone,
  Shield,
  Layers,
  CheckCircle,
} from "lucide-react";

export default function FeaturesPage() {
  const featureList = [
    {
      category: "Class & Roster Management",
      icon: School,
      items: [
        "Create, edit, and organize classes by subject, grade level, and section",
        "Unique 8-character enrollment codes for frictionless student onboarding",
        "Class roster tracking with enrollment status management",
        "Subject-specific dashboards and lesson repositories",
      ],
    },
    {
      category: "Lessons & Learning Materials",
      icon: BookOpen,
      items: [
        "Rich text lesson editor supporting drafts, publication, and archiving",
        "Secure document attachments with file type validation",
        "Chronological lesson ordering and modular topic classification",
        "Instant student access with downloadable resources",
      ],
    },
    {
      category: "Quizzes & Dynamic Assessments",
      icon: ClipboardCheck,
      items: [
        "Integrated Quiz & Assignment builder with points and deadlines",
        "Multiple-choice questions with automatic instant grading",
        "Short-answer and essay questions with manual grading and feedback",
        "Submission deadline enforcement with late-submission tracking",
      ],
    },
    {
      category: "Parent Announcement Board",
      icon: Megaphone,
      items: [
        "Dedicated board for broadcast messages from teachers",
        "Immediate alerts for remote schedule changes, exams, and milestones",
        "Audience targeting: all participants, students only, or parents only",
        "Pinned priority announcements for high-visibility notices",
      ],
    },
    {
      category: "Attendance & Schedules",
      icon: Calendar,
      items: [
        "Live schedule management with Google Meet / Zoom meeting link integration",
        "Attendance ledger: Present, Absent, Late, Excused",
        "One-click joining for scheduled remote learning sessions",
        "Attendance percentage tracking directly embedded in progress reports",
      ],
    },
    {
      category: "Academic Progress & Analytics",
      icon: BarChart3,
      items: [
        "Multi-child selector enabling parents to switch between children effortlessly",
        "Subject-by-subject performance summaries and score distributions",
        "Clear distinction between pending submissions and released final grades",
        "Teacher feedback logs detailing areas of student excellence and growth",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo size="sm" href="/" />
          <div className="flex items-center gap-3">
            <Link href="/" className="btn btn-secondary btn-sm">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16 sm:px-6">
        <div className="text-center mb-16 animate-fade-in">
          <span className="badge badge-primary mb-3">Capabilities</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Built for Teachers, Students & Parents
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Discover how LearnLink connects academic instruction, student submission workflows, and parent transparency.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feature, i) => (
            <div key={i} className="card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{feature.category}</h3>
                <ul className="space-y-3">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
