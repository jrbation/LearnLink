import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="mb-6">
        <BrandLogo size="md" href="/" />
      </div>
      <div className="max-w-md w-full card p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          You do not have the required permissions to view this resource. 
          LearnLink strictly enforces server-side role and record-level access control.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/signin" className="btn btn-secondary text-sm">
            <ArrowLeft className="w-4 h-4" />
            Switch Account
          </Link>
          <Link href="/" className="btn btn-primary text-sm">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
