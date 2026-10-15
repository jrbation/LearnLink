import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col items-center justify-center w-full px-12">
          <div className="w-32 h-32 rounded-3xl p-3 bg-white shadow-2xl flex items-center justify-center mb-6 animate-float border-2 border-white/20">
            <Image
              src="/logo.png"
              alt="LearnLink Logo"
              width={112}
              height={112}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 text-center tracking-tight">
            Learn<span style={{ color: "#2dd4bf" }}>Link</span>
          </h1>
          <p className="text-sm font-semibold tracking-wide text-teal-100 uppercase mb-3 text-center">
            Connecting Teachers, Students, and Parents
          </p>
          <p className="text-base text-slate-300 text-center max-w-sm leading-relaxed">
            A modern, centralized learning management platform for remote education.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center w-full max-w-md">
            <div className="glass-dark rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">🎓</div>
              <div className="text-xs text-teal-100 font-semibold mt-2">Teachers</div>
            </div>
            <div className="glass-dark rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">📚</div>
              <div className="text-xs text-teal-100 font-semibold mt-2">Students</div>
            </div>
            <div className="glass-dark rounded-2xl p-4">
              <div className="text-2xl font-bold text-white">👨‍👩‍👧</div>
              <div className="text-xs text-teal-100 font-semibold mt-2">Parents</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <BrandLogo size="md" href="/" showTagline />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
