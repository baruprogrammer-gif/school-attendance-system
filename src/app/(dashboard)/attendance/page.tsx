import Link from "next/link";
import { AttendanceStatus, Role } from "@prisma/client";
import { Save } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { attendanceStatusLabels } from "@/lib/attendance";
import { fromDateInputValue, toDateInputValue } from "@/lib/dates";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { saveAttendance } from "./actions";

export default async function AttendancePage({
  searchParams
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const session = await requireRole(["ADMIN", "TEACHER"]);
  const params = await searchParams;
  const selectedDate = params.date ?? toDateInputValue(new Date());

  const teacher = session.user.role === Role.TEACHER ? await prisma.teacher.findUnique({ where: { userId: session.user.id } }) : null;
  const [classes, teachers] = await Promise.all([
    prisma.schoolClass.findMany({
      where: teacher ? { homeroomTeacherId: teacher.id } : undefined,
      orderBy: [{ academicYear: "desc" }, { name: "asc" }]
    }),
    prisma.teacher.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } })
  ]);

  const selectedClassId = params.classId ?? classes[0]?.id;
  const selectedClass = selectedClassId
    ? await prisma.schoolClass.findUnique({
        where: { id: selectedClassId },
        include: {
          students: { include: { user: true }, orderBy: { user: { name: "asc" } } },
          attendanceRecords: {
            where: { date: fromDateInputValue(selectedDate) },
            include: { items: true },
            take: 1
          }
        }
      })
    : null;

  const existingRecord = selectedClass?.attendanceRecords[0];
  const existingByStudent = new Map(existingRecord?.items.map((item) => [item.studentId, item]) ?? []);
  const defaultTeacherId = teacher?.id ?? selectedClass?.homeroomTeacherId ?? teachers[0]?.id ?? "";

  return (
    <>
      <PageHeader
        eyebrow="Attendance"
        title="Daily attendance"
        description="Select a class and date, mark each student, and save the official daily attendance record."
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <form className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_auto]">
          <div>
            <label className="label">Class</label>
            <select className="input mt-1" name="classId" defaultValue={selectedClassId}>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name} - {schoolClass.academicYear}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input mt-1" name="date" type="date" defaultValue={selectedDate} />
          </div>
          <div className="flex items-end">
            <button className="btn-muted w-full" type="submit">
              Load
            </button>
          </div>
        </form>

        {selectedClass ? (
          <form action={saveAttendance} className="rounded-md border border-stone-200 bg-white shadow-sm">
            <input type="hidden" name="classId" value={selectedClass.id} />
            <input type="hidden" name="date" value={selectedDate} />
            <div className="grid gap-3 border-b border-stone-200 p-4 md:grid-cols-[1fr_1fr]">
              <div>
                <label className="label">Responsible teacher</label>
                <select className="input mt-1" name="teacherId" defaultValue={defaultTeacherId} disabled={session.user.role === Role.TEACHER}>
                  {teachers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.user.name}
                    </option>
                  ))}
                </select>
                {session.user.role === Role.TEACHER ? <input type="hidden" name="teacherId" value={defaultTeacherId} /> : null}
              </div>
              <div>
                <label className="label">Record notes</label>
                <input className="input mt-1" name="notes" defaultValue={existingRecord?.notes ?? ""} placeholder="Optional summary" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slatewash text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3">Current</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClass.students.map((student) => {
                    const item = existingByStudent.get(student.id);
                    return (
                      <tr key={student.id} className="border-t border-stone-100">
                        <td className="px-4 py-3">
                          <input type="hidden" name="studentIds" value={student.id} />
                          <p className="font-medium">{student.user.name}</p>
                          <p className="text-xs text-stone-500">{student.studentId}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select className="input max-w-44" name={`status-${student.id}`} defaultValue={item?.status ?? AttendanceStatus.PRESENT}>
                            {Object.values(AttendanceStatus).map((status) => (
                              <option key={status} value={status}>
                                {attendanceStatusLabels[status]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input className="input" name={`remarks-${student.id}`} defaultValue={item?.remarks ?? ""} placeholder="Optional" />
                        </td>
                        <td className="px-4 py-3">{item ? <StatusBadge status={item.status} /> : <span className="text-stone-500">Not saved</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-500">
                {selectedClass.students.length} students in {selectedClass.name}
              </p>
              <button className="btn-primary" type="submit" disabled={selectedClass.students.length === 0}>
                <Save className="h-4 w-4" />
                Save attendance
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-md border border-stone-200 bg-white p-6 text-center">
            <p className="text-stone-600">No class is available for attendance yet.</p>
            {session.user.role === Role.ADMIN ? (
              <Link href="/classes" className="btn-primary mt-4">
                Create class
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
