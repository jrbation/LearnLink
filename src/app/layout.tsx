import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "LearnLink — Connecting Teachers, Students, and Parents",
    template: "%s | LearnLink",
  },
  description:
    "LearnLink is a modern learning management platform that connects teachers, students, and parents for seamless remote education.",
  keywords: [
    "learning management",
    "education",
    "remote learning",
    "teachers",
    "students",
    "parents",
    "LMS",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
