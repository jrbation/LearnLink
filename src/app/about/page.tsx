import Link from "next/link";
import { ArrowLeft, HeartHandshake, ShieldCheck, Target, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <header className="glass border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo size="sm" href="/" />
          <Link href="/" className="btn btn-secondary btn-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6">
        <div className="text-center mb-16 animate-fade-in">
          <span className="badge badge-primary mb-3">About LearnLink</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Bridging the Gap in <span className="text-primary-600">Modern Education</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            LearnLink was founded with a clear mission: to unite teachers, students, and parents in a cohesive, transparent, and empowering learning community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="card p-8">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Our Mission</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We believe remote and hybrid learning shouldn&apos;t feel disconnected. By providing teachers with modern instructional tools and parents with direct, real-time insights into student progress, we create an ecosystem where every student flourishes.
            </p>
          </div>

          <div className="card p-8">
            <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Parent Involvement</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Research consistently demonstrates that student success skyrockets when parents are informed and engaged. LearnLink eliminates the guesswork for parents through our dedicated Announcement Board and real-time learning alerts.
            </p>
          </div>

          <div className="card p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Teacher Empowerment</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Teachers spend excessive time navigating fragmented software. LearnLink consolidates class rosters, lesson distribution, objective quiz auto-grading, manual essay review, and attendance tracking into one intuitive workspace.
            </p>
          </div>

          <div className="card p-8">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Privacy & Student Security</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Educational records are deeply sensitive. Our architectural foundation enforces server-side role validation, isolated parent-child links, and encrypted sessions to protect learner privacy at every level.
            </p>
          </div>
        </div>

        <div className="card bg-gradient-hero text-white p-8 sm:p-12 text-center rounded-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to experience LearnLink?</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Create your account today or explore our live demonstration classrooms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn btn-primary bg-white text-primary-700 hover:bg-slate-100">
              Sign Up Now
            </Link>
            <Link href="/auth/signin" className="btn btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20">
              Sign In to Demo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
