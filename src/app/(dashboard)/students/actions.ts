"use server";

import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const studentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  studentId: z.string().min(2),
  gender: z.string().min(1),
  birthDate: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  address: z.string().optional(),
  classId: z.string().min(1),
  password: z.string().min(6)
});

export async function createStudent(formData: FormData) {
  await requireRole(["ADMIN"]);

  const data = studentSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    studentId: formData.get("studentId"),
    gender: formData.get("gender"),
    birthDate: formData.get("birthDate") || undefined,
    guardianName: formData.get("guardianName") || undefined,
    guardianPhone: formData.get("guardianPhone") || undefined,
    address: formData.get("address") || undefined,
    classId: formData.get("classId"),
    password: formData.get("password")
  });

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: await hash(data.password, 10),
      role: Role.STUDENT,
      student: {
        create: {
          studentId: data.studentId,
          gender: data.gender,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          address: data.address,
          classId: data.classId
        }
      }
    }
  });

  revalidatePath("/students");
  revalidatePath("/dashboard");
}
