import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col items-center justify-center w-full px-12">
          <div className="w-20 h-20 bg-gradient-accent rounded-3xl flex items-center justify-center mb-8 animate-float">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Learn<span className="text-primary-300">Link</span>
          </h1>
          <p className="text-lg text-slate-300 text-center max-w-sm leading-relaxed">
            Connecting Teachers, Students, and Parents for modern, seamless learning.
          </p>

          <div className="mt-16 grid grid-cols-3 gap-6 text-center">
            <div className="glass-dark rounded-2xl p-5">
              <div className="text-2xl font-bold text-white">🎓</div>
              <div className="text-xs text-slate-400 mt-2">Teachers</div>
            </div>
            <div className="glass-dark rounded-2xl p-5">
              <div className="text-2xl font-bold text-white">📚</div>
              <div className="text-xs text-slate-400 mt-2">Students</div>
            </div>
            <div className="glass-dark rounded-2xl p-5">
              <div className="text-2xl font-bold text-white">👨‍👩‍👧</div>
              <div className="text-xs text-slate-400 mt-2">Parents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-accent rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                Learn<span className="text-primary-600">Link</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
