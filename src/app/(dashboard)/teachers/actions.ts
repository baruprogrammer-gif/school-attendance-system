"use server";

import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const teacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  employeeId: z.string().min(2),
  subject: z.string().min(2),
  phone: z.string().optional(),
  password: z.string().min(6)
});

export async function createTeacher(formData: FormData) {
  await requireRole(["ADMIN"]);

  const data = teacherSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    employeeId: formData.get("employeeId"),
    subject: formData.get("subject"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password")
  });

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: await hash(data.password, 10),
      role: Role.TEACHER,
      teacher: {
        create: {
          employeeId: data.employeeId,
          subject: data.subject,
          phone: data.phone
        }
      }
    }
  });

  revalidatePath("/teachers");
  revalidatePath("/dashboard");
}
