import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import {
  BookOpen,
  Users,
  Bell,
  BarChart3,
  Calendar,
  Shield,
  GraduationCap,
  School,
  UserCheck,
  ChevronRight,
  Star,
  Megaphone,
  ClipboardCheck,
  Video,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <BrandLogo size="md" href="/" />

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#roles"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                For Everyone
              </Link>
              <Link
                href="#announcements"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                Announcements
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/auth/signin" className="btn btn-ghost text-sm">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn btn-primary text-sm">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero pt-32 pb-24 lg:pt-40 lg:pb-32">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-400/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-primary-200 text-sm font-medium mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-yellow-400" />
            Modern Learning Management Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 animate-fade-in">
            Connecting Teachers,
            <br />
            <span className="bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">
              Students & Parents
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
            LearnLink simplifies remote learning with class management,
            assessments, real-time announcements, and progress tracking — all
            in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            <Link
              href="/auth/signup"
              className="btn btn-lg bg-white text-primary-700 hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="btn btn-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
            >
              Explore Features
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in">
            <div>
              <div className="text-3xl font-bold text-white">3</div>
              <div className="text-sm text-slate-400">User Roles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">10+</div>
              <div className="text-sm text-slate-400">Modules</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-sm text-slate-400">Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need for
              <span className="text-primary-600"> Modern Learning</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to make teaching,
              learning, and parent involvement seamless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: School,
                title: "Class Management",
                description:
                  "Create classes, manage rosters, and organize by subject or grade level with enrollment codes.",
                color: "bg-primary-50 text-primary-600",
              },
              {
                icon: BookOpen,
                title: "Lessons & Materials",
                description:
                  "Publish lessons with attached documents, instructions, and multimedia content.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: ClipboardCheck,
                title: "Quizzes & Assignments",
                description:
                  "Create assessments with auto-grading for MCQs, manual grading, and detailed feedback.",
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: BarChart3,
                title: "Progress Tracking",
                description:
                  "Real-time analytics on scores, completion rates, attendance, and academic trends.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: Calendar,
                title: "Class Scheduling",
                description:
                  "Schedule remote classes with meeting links, calendar views, and automatic reminders.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: Bell,
                title: "Smart Notifications",
                description:
                  "Event-driven alerts for announcements, grades, deadlines, and schedule changes.",
                color: "bg-rose-50 text-rose-600",
              },
              {
                icon: UserCheck,
                title: "Attendance Tracking",
                description:
                  "Mark and manage attendance with summaries and integration into progress reports.",
                color: "bg-cyan-50 text-cyan-600",
              },
              {
                icon: Megaphone,
                title: "Announcement Board",
                description:
                  "Publish class-wide announcements that reach both students and parents instantly.",
                color: "bg-orange-50 text-orange-600",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description:
                  "Role-based access control, encrypted passwords, and privacy-first data handling.",
                color: "bg-slate-100 text-slate-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="card p-6 card-interactive"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 text-accent-700 text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              For Everyone
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Tailored for Every
              <span className="text-accent-600"> Role</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Each user gets a personalized dashboard designed for their
              specific needs and responsibilities.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Teacher */}
            <div className="card overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600" />
              <div className="p-8">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-5">
                  <School className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Teachers
                </h3>
                <p className="text-slate-500 mb-6">
                  Full control over classes, content, assessments, and student
                  management.
                </p>
                <ul className="space-y-3">
                  {[
                    "Create & manage classes",
                    "Publish lessons & materials",
                    "Build quizzes & assignments",
                    "Grade submissions & feedback",
                    "Track attendance",
                    "Post announcements",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Student */}
            <div className="card overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-accent-500 to-accent-600" />
              <div className="p-8">
                <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center mb-5">
                  <GraduationCap className="w-7 h-7 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Students
                </h3>
                <p className="text-slate-500 mb-6">
                  Access learning materials, submit work, and track academic
                  progress.
                </p>
                <ul className="space-y-3">
                  {[
                    "Browse enrolled classes",
                    "Access lessons & downloads",
                    "Complete quizzes & assignments",
                    "View grades & feedback",
                    "Join remote classes",
                    "Monitor personal progress",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-accent-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Parent */}
            <div className="card overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-violet-500 to-violet-600" />
              <div className="p-8">
                <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-5">
                  <Users className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Parents
                </h3>
                <p className="text-slate-500 mb-6">
                  Stay informed with your child&apos;s academics, schedules,
                  and teacher updates.
                </p>
                <ul className="space-y-3">
                  {[
                    "View child's progress reports",
                    "Read class announcements",
                    "Check class schedules",
                    "Track attendance records",
                    "Receive learning alerts",
                    "Communicate with teachers",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcement Board Showcase */}
      <section id="announcements" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm font-medium mb-4">
                <Megaphone className="w-4 h-4" />
                Parent Announcement Board
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Never Miss an
                <span className="text-orange-600"> Important Update</span>
              </h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                The Parent Announcement Board keeps parents informed with
                real-time updates from teachers — schedule changes, exam
                reminders, assignment deadlines, and more.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Instant notifications for new announcements",
                  "Class-specific updates from your child's teachers",
                  "Schedule changes and remote class reminders",
                  "Assignment deadlines and exam notifications",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Get Started as a Parent
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Announcement Preview Card */}
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary-100 rounded-full opacity-50 blur-2xl" />

              <div className="relative card p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-orange-500" />
                  Recent Announcements
                </h3>

                {/* Sample Announcement 1 */}
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="flex items-start justify-between mb-2">
                    <span className="badge badge-warning">Schedule Change</span>
                    <span className="text-xs text-slate-400">2 hours ago</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">
                    English Remote Class Schedule Change
                  </h4>
                  <p className="text-sm text-slate-600">
                    Our English remote class has been moved to Friday at 9:00
                    AM. Please remind your child to join on time.
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <School className="w-3.5 h-3.5" />
                    English 101 • Ms. Sarah Johnson
                  </div>
                </div>

                {/* Sample Announcement 2 */}
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-start justify-between mb-2">
                    <span className="badge badge-info">Exam</span>
                    <span className="text-xs text-slate-400">Yesterday</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">
                    Math Midterm Exam Next Week
                  </h4>
                  <p className="text-sm text-slate-600">
                    The Math midterm exam is scheduled for next Wednesday.
                    Please ensure your child reviews chapters 5–8.
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <School className="w-3.5 h-3.5" />
                    Mathematics 201 • Mr. David Chen
                  </div>
                </div>

                {/* Sample Announcement 3 */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-start justify-between mb-2">
                    <span className="badge badge-success">Activity</span>
                    <span className="text-xs text-slate-400">2 days ago</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">
                    Science Fair Project Submission
                  </h4>
                  <p className="text-sm text-slate-600">
                    Reminder: Science fair project proposals are due this
                    Friday. Help your child choose a topic!
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                    <School className="w-3.5 h-3.5" />
                    Science 101 • Ms. Emily Parker
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Remote Classes Section */}
      <section className="py-24 bg-gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-sm font-medium mb-4">
            <Video className="w-4 h-4" />
            Remote Learning
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Seamless Remote Class Experience
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12">
            Teachers schedule classes, students join with one click, and
            parents stay informed — all integrated into the learning workflow.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Calendar,
                title: "Schedule",
                description:
                  "Teachers create class sessions with dates, times, and meeting links",
              },
              {
                icon: Video,
                title: "Join",
                description:
                  "Students see upcoming sessions and join through provided meeting links",
              },
              {
                icon: Bell,
                title: "Stay Updated",
                description:
                  "Parents receive notifications about schedules and any changes",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to Transform Your
            <span className="text-primary-600"> Learning Experience?</span>
          </h2>
          <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
            Join LearnLink today and experience a modern, connected approach
            to education that brings teachers, students, and parents together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/about" className="btn btn-secondary btn-lg">
              Learn More About LearnLink
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="mb-4">
                <BrandLogo size="md" href="/" darkMode />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connecting Teachers, Students, and Parents for modern,
                seamless learning experiences.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-2.5">
                <li><Link href="#features" className="text-sm hover:text-primary-400 transition-colors">Features</Link></li>
                <li><Link href="#roles" className="text-sm hover:text-primary-400 transition-colors">For Teachers</Link></li>
                <li><Link href="#roles" className="text-sm hover:text-primary-400 transition-colors">For Students</Link></li>
                <li><Link href="#roles" className="text-sm hover:text-primary-400 transition-colors">For Parents</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-2.5">
                <li><Link href="/about" className="text-sm hover:text-primary-400 transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-sm hover:text-primary-400 transition-colors">Contact</Link></li>
                <li><Link href="/features" className="text-sm hover:text-primary-400 transition-colors">All Features</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                Get Started
              </h4>
              <ul className="space-y-2.5">
                <li><Link href="/auth/signin" className="text-sm hover:text-primary-400 transition-colors">Sign In</Link></li>
                <li><Link href="/auth/signup" className="text-sm hover:text-primary-400 transition-colors">Register</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} LearnLink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
