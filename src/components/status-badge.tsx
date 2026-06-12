import type { AttendanceStatus } from "@prisma/client";
import { attendanceStatusLabels, attendanceStatusTone } from "@/lib/attendance";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-semibold", attendanceStatusTone[status])}>
      {attendanceStatusLabels[status]}
    </span>
  );
}
