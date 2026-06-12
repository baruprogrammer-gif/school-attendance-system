-- School Attendance Management System - Supabase SQL setup
-- Paste this file into the Supabase SQL Editor to create the schema and demo data.
-- Demo password for all accounts: password123

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Prisma migration bookkeeping.
-- This lets future `prisma migrate deploy` runs see the initial migration as already applied.
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- NextAuth and application tables
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "SchoolClass" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "room" TEXT,
    "academicYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "homeroomTeacherId" TEXT,
    CONSTRAINT "SchoolClass_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttendanceItem" (
    "id" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recordId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    CONSTRAINT "AttendanceItem_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "SchoolClass_name_academicYear_key" ON "SchoolClass"("name", "academicYear");
CREATE UNIQUE INDEX "Teacher_employeeId_key" ON "Teacher"("employeeId");
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");
CREATE UNIQUE INDEX "AttendanceRecord_classId_date_key" ON "AttendanceRecord"("classId", "date");
CREATE INDEX "AttendanceRecord_date_idx" ON "AttendanceRecord"("date");
CREATE UNIQUE INDEX "AttendanceItem_recordId_studentId_key" ON "AttendanceItem"("recordId", "studentId");
CREATE INDEX "AttendanceItem_studentId_idx" ON "AttendanceItem"("studentId");

-- Foreign keys
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SchoolClass" ADD CONSTRAINT "SchoolClass_homeroomTeacherId_fkey" FOREIGN KEY ("homeroomTeacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AttendanceItem" ADD CONSTRAINT "AttendanceItem_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "AttendanceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceItem" ADD CONSTRAINT "AttendanceItem_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Demo data
-- All demo users use password123. pgcrypto creates bcrypt-compatible hashes.
WITH demo_password AS (
    SELECT crypt('password123', gen_salt('bf', 10)) AS hash
)
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
SELECT *
FROM (
    SELECT 'user_admin_demo' AS "id", 'Admin Sekolah' AS "name", 'admin@school.test' AS "email", hash AS "password", 'ADMIN'::"Role" AS "role", CURRENT_TIMESTAMP AS "createdAt", CURRENT_TIMESTAMP AS "updatedAt" FROM demo_password
    UNION ALL
    SELECT 'user_teacher_demo', 'Maya Santoso', 'teacher@school.test', hash, 'TEACHER'::"Role", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM demo_password
    UNION ALL
    SELECT 'user_student_demo', 'Adi Pratama', 'student@school.test', hash, 'STUDENT'::"Role", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM demo_password
    UNION ALL
    SELECT 'user_student_nadia', 'Nadia Putri', 'nadia@school.test', hash, 'STUDENT'::"Role", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM demo_password
    UNION ALL
    SELECT 'user_student_bima', 'Bima Wijaya', 'bima@school.test', hash, 'STUDENT'::"Role", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP FROM demo_password
) AS seed_users
ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "password" = EXCLUDED."password",
    "role" = EXCLUDED."role",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Teacher" ("id", "employeeId", "subject", "phone", "createdAt", "updatedAt", "userId")
VALUES ('teacher_demo', 'T-1001', 'Mathematics', '+62 812 1000 2000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'user_teacher_demo')
ON CONFLICT ("userId") DO UPDATE SET
    "employeeId" = EXCLUDED."employeeId",
    "subject" = EXCLUDED."subject",
    "phone" = EXCLUDED."phone",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "SchoolClass" ("id", "name", "grade", "room", "academicYear", "createdAt", "updatedAt", "homeroomTeacherId")
VALUES ('class_10a_demo', 'Class 10A', '10', 'A-201', '2025/2026', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'teacher_demo')
ON CONFLICT ("name", "academicYear") DO UPDATE SET
    "grade" = EXCLUDED."grade",
    "room" = EXCLUDED."room",
    "homeroomTeacherId" = EXCLUDED."homeroomTeacherId",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Student" ("id", "studentId", "gender", "guardianName", "guardianPhone", "address", "createdAt", "updatedAt", "userId", "classId")
VALUES
    ('student_demo', 'S-1001', 'Male', 'Guardian Adi', '+62 812 3000 4000', 'Jl. Pendidikan No. 10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'user_student_demo', 'class_10a_demo'),
    ('student_nadia', 'S-1002', 'Female', 'Guardian Nadia', '+62 812 3000 4000', 'Jl. Pendidikan No. 10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'user_student_nadia', 'class_10a_demo'),
    ('student_bima', 'S-1003', 'Male', 'Guardian Bima', '+62 812 3000 4000', 'Jl. Pendidikan No. 10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'user_student_bima', 'class_10a_demo')
ON CONFLICT ("userId") DO UPDATE SET
    "studentId" = EXCLUDED."studentId",
    "gender" = EXCLUDED."gender",
    "guardianName" = EXCLUDED."guardianName",
    "guardianPhone" = EXCLUDED."guardianPhone",
    "address" = EXCLUDED."address",
    "classId" = EXCLUDED."classId",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "AttendanceRecord" ("id", "date", "notes", "createdAt", "updatedAt", "classId", "teacherId")
VALUES ('attendance_today_demo', CURRENT_DATE::timestamp, 'Seed attendance record', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'class_10a_demo', 'teacher_demo')
ON CONFLICT ("classId", "date") DO UPDATE SET
    "notes" = EXCLUDED."notes",
    "teacherId" = EXCLUDED."teacherId",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "AttendanceItem" ("id", "status", "remarks", "createdAt", "updatedAt", "recordId", "studentId")
VALUES
    ('attendance_item_adi', 'PRESENT', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'attendance_today_demo', 'student_demo'),
    ('attendance_item_nadia', 'LATE', 'Arrived after first bell', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'attendance_today_demo', 'student_nadia'),
    ('attendance_item_bima', 'PRESENT', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'attendance_today_demo', 'student_bima')
ON CONFLICT ("recordId", "studentId") DO UPDATE SET
    "status" = EXCLUDED."status",
    "remarks" = EXCLUDED."remarks",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
VALUES (
    '20260612000000_init_sql_setup',
    'c10d31e68a18f84a40f4f68867a2263bd4443ce6637405eb95e1c1e9fe1dffc3',
    now(),
    '20260612000000_init',
    NULL,
    NULL,
    now(),
    1
)
ON CONFLICT ("id") DO NOTHING;
