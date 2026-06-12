import { AttendanceStatus } from "@prisma/client";

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused"
};

export const attendanceStatusTone: Record<AttendanceStatus, string> = {
  PRESENT: "bg-emerald-100 text-emerald-800",
  ABSENT: "bg-rose-100 text-rose-800",
  LATE: "bg-amber-100 text-amber-800",
  EXCUSED: "bg-sky-100 text-sky-800"
};

export function attendanceRate(present: number, total: number) {
  if (total === 0) return 0;
  return (present / total) * 100;
}
