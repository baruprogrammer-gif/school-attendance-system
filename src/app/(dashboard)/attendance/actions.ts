"use server";

import { AttendanceStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { fromDateInputValue } from "@/lib/dates";

const attendanceSchema = z.object({
  classId: z.string().min(1),
  teacherId: z.string().min(1),
  date: z.string().min(10),
  notes: z.string().optional()
});

export async function saveAttendance(formData: FormData) {
  const session = await requireRole(["ADMIN", "TEACHER"]);
  const data = attendanceSchema.parse({
    classId: formData.get("classId"),
    teacherId: formData.get("teacherId"),
    date: formData.get("date"),
    notes: formData.get("notes") || undefined
  });

  const teacher =
    session.user.role === Role.TEACHER
      ? await prisma.teacher.findUniqueOrThrow({ where: { userId: session.user.id } })
      : await prisma.teacher.findUniqueOrThrow({ where: { id: data.teacherId } });

  if (session.user.role === Role.TEACHER) {
    const allowedClass = await prisma.schoolClass.count({
      where: {
        id: data.classId,
        homeroomTeacherId: teacher.id
      }
    });

    if (!allowedClass) {
      throw new Error("You can only mark attendance for your assigned classes.");
    }
  }

  const studentIds = formData.getAll("studentIds").map(String);
  const items = studentIds.map((studentId) => ({
    studentId,
    status: z.nativeEnum(AttendanceStatus).parse(formData.get(`status-${studentId}`)),
    remarks: String(formData.get(`remarks-${studentId}`) ?? "") || undefined
  }));

  await prisma.attendanceRecord.upsert({
    where: {
      classId_date: {
        classId: data.classId,
        date: fromDateInputValue(data.date)
      }
    },
    create: {
      classId: data.classId,
      teacherId: teacher.id,
      date: fromDateInputValue(data.date),
      notes: data.notes,
      items: {
        create: items
      }
    },
    update: {
      teacherId: teacher.id,
      notes: data.notes,
      items: {
        deleteMany: {},
        create: items
      }
    }
  });

  revalidatePath("/attendance");
  revalidatePath("/history");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
}
