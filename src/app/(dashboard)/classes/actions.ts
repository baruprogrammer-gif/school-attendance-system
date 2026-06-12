"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const classSchema = z.object({
  name: z.string().min(2),
  grade: z.string().min(1),
  room: z.string().optional(),
  academicYear: z.string().min(4),
  homeroomTeacherId: z.string().optional()
});

export async function createClass(formData: FormData) {
  await requireRole(["ADMIN"]);

  const data = classSchema.parse({
    name: formData.get("name"),
    grade: formData.get("grade"),
    room: formData.get("room") || undefined,
    academicYear: formData.get("academicYear"),
    homeroomTeacherId: formData.get("homeroomTeacherId") || undefined
  });

  await prisma.schoolClass.create({ data });
  revalidatePath("/classes");
  revalidatePath("/dashboard");
}
