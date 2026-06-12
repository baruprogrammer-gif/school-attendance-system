import type { Role } from "@prisma/client";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  STUDENT: "Student"
};

export function canManageSchool(role?: Role) {
  return role === "ADMIN";
}

export function canManageAttendance(role?: Role) {
  return role === "ADMIN" || role === "TEACHER";
}
