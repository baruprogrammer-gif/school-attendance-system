# School Attendance Management System

A complete MVP for a role-based school attendance app built with Next.js, TypeScript, Tailwind CSS, Supabase PostgreSQL, Prisma, and NextAuth.

## Features

- Credentials login with Admin, Teacher, and Student roles
- Admin dashboard for students, teachers, and classes
- Teacher/Admin daily attendance entry
- Attendance history for staff and students
- Attendance reports with PDF and Excel export
- Supabase-ready PostgreSQL schema through Prisma
- Seed data for demo accounts
- Responsive UI for desktop and mobile

## Demo Accounts

All seeded accounts use `password123`.

| Role | Email |
| --- | --- |
| Admin | `admin@school.test` |
| Teacher | `teacher@school.test` |
| Student | `student@school.test` |

## Environment Setup

Copy `.env.example` to `.env` and fill in your Supabase values.

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
AUTH_SECRET="replace-with-a-random-secret"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Use the pooled Supabase connection string for `DATABASE_URL` and the direct connection string for `DIRECT_URL`.

## Run Locally

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Database Schema

The schema lives in `prisma/schema.prisma` and includes:

- NextAuth models: `User`, `Account`, `Session`, `VerificationToken`
- School models: `Teacher`, `Student`, `SchoolClass`
- Attendance models: `AttendanceRecord`, `AttendanceItem`
- Enums: `Role`, `AttendanceStatus`

## Netlify Deployment

1. Create a Supabase project and copy the PostgreSQL connection strings.
2. In Netlify, set the Node version to `22`. This repository also includes `.node-version` with `22`.
3. Set the Netlify build command:

```bash
npm run prisma:deploy && npm run build
```

4. Add these required environment variables in Netlify from `.env.example`:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `AUTH_TRUST_HOST`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

5. Deploy the site. The Netlify build command applies Prisma migrations with `prisma migrate deploy`, then runs the Next.js production build.

## Project Structure

```text
prisma/
  schema.prisma
  seed.ts
src/
  app/
    (dashboard)/
      attendance/
      classes/
      dashboard/
      history/
      reports/
      students/
      teachers/
    api/
      auth/
      reports/
    login/
  components/
  lib/
  types/
auth.ts
middleware.ts
```

## Supabase Connection

Prisma uses Supabase as the PostgreSQL database. `src/lib/supabase.ts` also provides Supabase browser/admin clients for future storage or realtime features. This MVP stores attendance data through Prisma so the database schema remains strongly typed and migration-friendly.
