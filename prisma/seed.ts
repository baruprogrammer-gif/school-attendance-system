import { AttendanceStatus, PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.test" },
    update: {},
    create: {
      name: "Admin Sekolah",
      email: "admin@school.test",
      password,
      role: Role.ADMIN
    }
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@school.test" },
    update: {},
    create: {
      name: "Maya Santoso",
      email: "teacher@school.test",
      password,
      role: Role.TEACHER
    }
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      employeeId: "T-1001",
      subject: "Mathematics",
      phone: "+62 812 1000 2000"
    }
  });

  const schoolClass = await prisma.schoolClass.upsert({
    where: { name_academicYear: { name: "Class 10A", academicYear: "2025/2026" } },
    update: { homeroomTeacherId: teacher.id },
    create: {
      name: "Class 10A",
      grade: "10",
      room: "A-201",
      academicYear: "2025/2026",
      homeroomTeacherId: teacher.id
    }
  });

  const students = await Promise.all(
    [
      ["S-1001", "Adi Pratama", "student@school.test", "Male"],
      ["S-1002", "Nadia Putri", "nadia@school.test", "Female"],
      ["S-1003", "Bima Wijaya", "bima@school.test", "Male"]
    ].map(async ([studentId, name, email, gender]) => {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          name,
          email,
          password,
          role: Role.STUDENT
        }
      });

      return prisma.student.upsert({
        where: { userId: user.id },
        update: { classId: schoolClass.id },
        create: {
          userId: user.id,
          studentId,
          gender,
          guardianName: "Guardian " + name.split(" ")[0],
          guardianPhone: "+62 812 3000 4000",
          address: "Jl. Pendidikan No. 10",
          classId: schoolClass.id
        }
      });
    })
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.attendanceRecord.upsert({
    where: {
      classId_date: {
        classId: schoolClass.id,
        date: today
      }
    },
    update: {},
    create: {
      classId: schoolClass.id,
      teacherId: teacher.id,
      date: today,
      notes: "Seed attendance record",
      items: {
        create: students.map((student, index) => ({
          studentId: student.id,
          status: index === 1 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
          remarks: index === 1 ? "Arrived after first bell" : undefined
        }))
      }
    }
  });

  console.log(`Seed complete. Admin: ${admin.email}, Teacher: ${teacherUser.email}, Student: student@school.test`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
