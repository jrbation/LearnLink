import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  showTagline?: boolean;
}

const SIZES = {
  sm: { width: 36, height: 36, container: "h-9 w-9" },
  md: { width: 44, height: 44, container: "h-11 w-11" },
  lg: { width: 56, height: 56, container: "h-14 w-14" },
  xl: { width: 88, height: 88, container: "h-22 w-22" },
};

export function BrandLogo({
  className = "",
  size = "md",
  href,
  showTagline = false,
}: BrandLogoProps) {
  const config = SIZES[size] || SIZES.md;

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${config.container} rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white shadow-xs border border-slate-100`}>
        <Image
          src="/logo.png"
          alt="LearnLink"
          width={config.width}
          height={config.height}
          priority
          className="object-contain w-full h-full p-0.5"
        />
      </div>
      <div>
        <span className="text-lg font-bold text-slate-900 tracking-tight leading-none block">
          Learn<span style={{ color: "#008080" }}>Link</span>
        </span>
        {showTagline && (
          <span className="text-[10px] text-slate-500 font-medium block mt-0.5 tracking-tight">
            Connecting Teachers, Students, and Parents
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
