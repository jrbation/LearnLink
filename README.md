# LearnLink

A modern Learning Management System (LMS) that connects teachers, students, and parents for seamless remote education experiences.

## Overview

LearnLink is a full-stack educational platform designed to facilitate classroom management, assignment tracking, communication, and academic progress monitoring. It provides role-based dashboards for teachers, students, and parents, enabling efficient collaboration in educational settings.

**Live Demo:** https://learnlink-ashy.vercel.app

## Key Features

### For Teachers
- **Class Management**: Create and manage classes with enrollment codes for student access
- **Lesson Creation**: Organize course content with lessons and material uploads
- **Assignment & Assessment**: Create assignments and quizzes with grading capabilities
- **Attendance Tracking**: Mark and track student attendance for scheduled sessions
- **Announcements**: Share important updates with students and parents
- **Messaging**: Direct communication with students and parents

### For Students
- **Class Enrollment**: Join classes using teacher-provided enrollment codes
- **Assignment Submission**: Submit work and track grades
- **Lesson Access**: View course materials and learning resources
- **Schedule View**: See upcoming classes and deadlines
- **Progress Tracking**: Monitor academic performance and feedback

### For Parents
- **Child Linking**: Connect to student accounts via email pairing
- **Academic Monitoring**: View child's grades, assignments, and progress
- **Attendance Records**: Track attendance history
- **Communication**: Direct messaging with teachers
- **Announcements**: Receive school and class updates

### Platform Features
- **Role-Based Access Control**: Three distinct user roles (TEACHER, STUDENT, PARENT)
- **Real-time Notifications**: In-app notifications for important events
- **Secure Authentication**: Password-based authentication with bcrypt hashing
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **File Upload Support**: Material and document sharing capabilities

## Technology Stack

### Frontend
- **Next.js 16.4.1**: React framework with App Router and Turbopack
- **React 19.3.0**: UI library
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Lucide React**: Icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **NextAuth v5 (beta)**: Authentication and session management
- **Prisma 6.6.0**: Type-safe ORM for database operations
- **bcryptjs**: Password hashing

### Database
- **PostgreSQL**: Relational database (Neon Serverless PostgreSQL recommended)
- **Prisma Client**: Database client with generated types

### Validation & Forms
- **Zod 4.6.7**: Schema validation
- **react-hook-form 7.90.0**: Form state management
- **@hookform/resolvers**: Zod integration with react-hook-form

### Testing
- **Vitest 5.0.5**: Unit testing framework
- **Vite 8.3.4**: Test runner

### Deployment
- **Vercel**: Production hosting platform

## System Architecture

LearnLink follows a monolithic full-stack architecture using Next.js's App Router:

```mermaid
graph TB
    A[Client Browser] --> B[Next.js Frontend]
    B --> C[API Routes]
    C --> D[Prisma ORM]
    D --> E[PostgreSQL Database]
    C --> F[NextAuth]
    F --> E
    B --> G[Static Pages]
    B --> H[Dashboard Routes]
    H --> C
```

### Architecture Components

- **Frontend**: Next.js App Router with Server Components and Client Components
- **API Layer**: RESTful API routes under `/api/*` for server-side operations
- **Authentication**: NextAuth v5 with JWT strategy and credentials provider
- **Database Layer**: Prisma ORM with PostgreSQL, supporting direct connection for migrations
- **State Management**: React hooks and server state via API routes

## Prerequisites

- **Node.js**: 20.x or 22.x (recommended)
- **npm**: 10.x or higher
- **PostgreSQL**: 14.x or higher (local or cloud database)
- **Git**: For cloning the repository

## Installation and Local Development

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LearnLink
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables) section).

### 4. Set Up the Database

#### Option A: Using PostgreSQL directly

Ensure your PostgreSQL database is running, then generate Prisma Client:

```bash
npx prisma generate
```

Push the schema to your database:

```bash
npx prisma db push
```

#### Option B: Using Neon Serverless PostgreSQL

1. Create a Neon account at https://console.neon.tech
2. Create a new project
3. Copy the connection string to your `.env` file as `DATABASE_URL`
4. Also set `DIRECT_URL` for migrations (provided by Neon)
5. Run:

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/learnlink?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/learnlink?schema=public"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32-or-node-crypto"

# Email Configuration (Optional - for future email notifications)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@learnlink.app"

# File Upload Configuration
UPLOAD_MAX_SIZE_MB="10"
UPLOAD_DIR="./uploads"

# Application
APP_NAME="LearnLink"
APP_URL="http://localhost:3000"
```

### Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Project Structure

```
LearnLink/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── seed.ts                # Database seeding script
│   └── dev.db                 # Local SQLite database (development)
├── public/
│   └── logo.png               # Application logo
├── src/
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── classes/       # Class management
│   │   │   ├── assignments/   # Assignment CRUD
│   │   │   ├── lessons/       # Lesson management
│   │   │   ├── grades/        # Grading system
│   │   │   ├── attendance/    # Attendance tracking
│   │   │   ├── announcements/  # Announcements
│   │   │   ├── messages/      # Messaging system
│   │   │   ├── notifications/  # Notification system
│   │   │   ├── parent/        # Parent-specific endpoints
│   │   │   ├── profile/       # User profile
│   │   │   ├── schedules/     # Class schedules
│   │   │   ├── submissions/   # Assignment submissions
│   │   │   └── upload/        # File upload handling
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Role-based dashboards
│   │   │   ├── teacher/       # Teacher dashboard
│   │   │   ├── student/       # Student dashboard
│   │   │   └── parent/        # Parent dashboard
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── features/          # Features page
│   │   ├── unauthorized/      # Unauthorized access page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css        # Global styles
│   │   ├── icon.png           # Favicon
│   │   └── manifest.ts        # Web app manifest
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── header.tsx     # Dashboard header
│   │   │   ├── sidebar.tsx    # Dashboard sidebar
│   │   │   └── dashboard-shell.tsx
│   │   ├── brand-logo.tsx     # Logo component
│   │   └── providers.tsx      # Context providers
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── auth-utils.ts      # Authentication utilities
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── validations.ts     # Zod validation schemas
│   │   ├── notifications.ts   # Notification utilities
│   │   └── utils.ts           # General utilities
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── __tests__/
│       ├── validations.test.ts # Validation tests
│       ├── utils.test.ts       # Utility function tests
│       └── grading.test.ts     # Grading logic tests
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "role": "TEACHER"
}
```

**Response (201):**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "cuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "TEACHER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/api/auth/[...nextauth]`
NextAuth authentication handler for sign-in, sign-out, and session management.

### Class Management

#### GET `/api/classes`
Fetch all classes (teacher can only see their own classes).

#### POST `/api/classes`
Create a new class (teacher only).

**Request Body:**
```json
{
  "name": "AP Biology",
  "subject": "Science",
  "gradeLevel": "11",
  "section": "A",
  "description": "Advanced biology course"
}
```

#### GET `/api/classes/[id]`
Fetch a specific class by ID.

### Assignment Management

#### GET `/api/assignments`
Fetch assignments for a class.

#### POST `/api/assignments`
Create a new assignment (teacher only).

#### GET `/api/assignments/[id]`
Fetch a specific assignment.

### Enrollment

#### POST `/api/enrollments`
Enroll a student in a class using enrollment code.

**Request Body:**
```json
{
  "enrollmentCode": "ABCD123"
}
```

### Attendance

#### POST `/api/attendance`
Mark attendance for a scheduled session (teacher only).

**Request Body:**
```json
{
  "scheduleId": "schedule-id",
  "records": [
    {
      "studentId": "student-id",
      "status": "PRESENT",
      "notes": ""
    }
  ]
}
```

### Grades

#### POST `/api/grades`
Submit a grade for a student submission (teacher only).

**Request Body:**
```json
{
  "submissionId": "submission-id",
  "score": 85,
  "maxScore": 100,
  "feedback": "Good work!"
}
```

### Parent-Child Linking

#### POST `/api/parent/link`
Link a parent account to a student account (parent only).

**Request Body:**
```json
{
  "childEmail": "student@example.com"
}
```

### Notifications

#### GET `/api/notifications`
Fetch notifications for the authenticated user.

#### POST `/api/notifications/mark-all-read`
Mark all notifications as read for the authenticated user.

## Available Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
```

### Testing
```bash
npm test             # Run Vitest tests
```

### Linting
```bash
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev # Create and apply migration (development)
```

## Authentication and Security

### Authentication Mechanism
- **NextAuth v5** with credentials provider
- **JWT-based sessions** with 7-day expiration
- **bcryptjs** for password hashing (10 rounds)
- **Role-based access control** (TEACHER, STUDENT, PARENT)

### Security Considerations
- Passwords are hashed using bcrypt before storage
- Email addresses are normalized to lowercase
- Session tokens are stored securely via NextAuth
- API routes check user roles before allowing certain operations
- Environment variables are used for sensitive configuration

### Known Limitations
- Email verification is not currently implemented
- Password reset functionality requires SMTP configuration
- Rate limiting is not implemented on API routes
- File uploads lack virus scanning
- No brute-force protection on authentication endpoints

## Testing and Quality Assurance

### Testing Framework
- **Vitest** for unit testing
- Test files located in `src/__tests__/`

### Running Tests
```bash
npm test
```

### Test Coverage
- Validation schemas (sign-up, sign-in, class creation, assignments, attendance)
- Utility functions
- Grading logic

### Current Status
Tests are configured but full coverage is not complete. Additional integration and E2E tests are recommended for production readiness.

## Deployment

### Vercel Deployment

The project is configured for Vercel deployment. Follow these steps:

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Vercel**: Import the project in Vercel dashboard
3. **Configure Environment Variables** in Vercel:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `DIRECT_URL` (PostgreSQL direct connection for migrations)
   - `NEXTAUTH_URL` (Production URL, e.g., `https://your-domain.com`)
   - `NEXTAUTH_SECRET` (Generate using the command in Environment Variables section)
4. **Deploy**: Vercel will automatically build and deploy

### Build Configuration
- **Build Command**: `prisma generate && next build` (configured in Vercel)
- **Output Directory**: Next.js default (`.next`)
- **Framework**: Next.js 16.4.1

### Database Considerations
- Use Neon Serverless PostgreSQL for Vercel deployments
- Ensure `DATABASE_URL` and `DIRECT_URL` are properly configured
- Run `prisma db push` or migrations before deploying if schema changes were made

### Current Deployment
**Production URL:** https://learnlink-ashy.vercel.app

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running (if using local database)
- Verify `DATABASE_URL` in `.env` is correct
- Check if database exists and user has proper permissions
- For Neon, ensure both `DATABASE_URL` and `DIRECT_URL` are set

### Prisma Client Issues
```bash
npx prisma generate
```
Regenerate Prisma Client if you encounter type errors.

### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Ensure Node.js version is compatible (20.x or 22.x)

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set in `.env`
- Check `NEXTAUTH_URL` matches your development/production URL
- Ensure cookies are enabled in your browser

### Module Resolution Errors
- Ensure `@/*` path alias is configured in `tsconfig.json`
- Restart TypeScript server in your IDE

## Roadmap

### Planned Improvements
- Email verification for new accounts
- Password reset via email
- Real-time messaging with WebSocket support
- File storage integration (AWS S3, Cloudflare R2)
- Rich text editor for lesson content
- Quiz auto-grading with multiple choice questions
- Parent account invitation system
- Calendar integration for schedules
- Analytics dashboard for teachers
- Mobile app (React Native)

### Potential Enhancements
- Video conferencing integration
- Discussion forums
- Peer review assignments
- Rubric-based grading
- Export grades to CSV/PDF
- Multi-language support
- Dark mode
- Accessibility improvements (WCAG compliance)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow the existing code style** (TypeScript, ESLint)
3. **Write tests** for new features
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description of changes

### Development Workflow
1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Commit and push changes
6. Open a pull request

## License

This project is private. All rights reserved.

## Author

LearnLink - A modern Learning Management System

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
- Database managed with [Prisma](https://prisma.io)
- Authentication powered by [NextAuth](https://authjs.dev)
- Icons from [Lucide](https://lucide.dev)
