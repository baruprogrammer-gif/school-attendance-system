import { Download } from "lucide-react";
import { AttendanceStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { attendanceRate } from "@/lib/attendance";
import { toDateInputValue } from "@/lib/dates";
import { requireRole } from "@/lib/session";
import { formatPercent } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ classId?: string; from?: string; to?: string }>;
}) {
  const session = await requireRole(["ADMIN", "TEACHER"]);
  const params = await searchParams;
  const today = toDateInputValue(new Date());
  const from = params.from ?? today;
  const to = params.to ?? today;

  const teacher = session.user.role === Role.TEACHER ? await prisma.teacher.findUnique({ where: { userId: session.user.id } }) : null;
  const classes = await prisma.schoolClass.findMany({
    where: teacher ? { homeroomTeacherId: teacher.id } : undefined,
    orderBy: [{ academicYear: "desc" }, { name: "asc" }]
  });
  const allowedClassIds = new Set(classes.map((schoolClass) => schoolClass.id));
  const classId = params.classId && allowedClassIds.has(params.classId) ? params.classId : classes[0]?.id;

  const items = classId
    ? await prisma.attendanceItem.findMany({
        where: {
          record: {
            classId,
            date: {
              gte: new Date(`${from}T00:00:00.000Z`),
              lte: new Date(`${to}T23:59:59.999Z`)
            }
          }
        },
        include: {
          student: { include: { user: true } },
          record: { include: { class: true } }
        },
        orderBy: [{ record: { date: "asc" } }, { student: { user: { name: "asc" } } }]
      })
    : [];

  const counts = Object.fromEntries(
    Object.values(AttendanceStatus).map((status) => [status, items.filter((item) => item.status === status).length])
  ) as Record<AttendanceStatus, number>;
  const exportQuery = new URLSearchParams({ classId: classId ?? "", from, to }).toString();

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Attendance reports"
        description="Filter attendance by class and date range, then export reports as Excel or PDF."
        action={
          <>
            <a className="btn-muted" href={`/api/reports/attendance/excel?${exportQuery}`}>
              <Download className="h-4 w-4" />
              Excel
            </a>
            <a className="btn-muted" href={`/api/reports/attendance/pdf?${exportQuery}`}>
              <Download className="h-4 w-4" />
              PDF
            </a>
          </>
        }
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <form className="grid gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px_auto]">
          <div>
            <label className="label">Class</label>
            <select className="input mt-1" name="classId" defaultValue={classId}>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name} - {schoolClass.academicYear}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">From</label>
            <input className="input mt-1" name="from" type="date" defaultValue={from} />
          </div>
          <div>
            <label className="label">To</label>
            <input className="input mt-1" name="to" type="date" defaultValue={to} />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" type="submit">
              Apply
            </button>
          </div>
        </form>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Entries" value={items.length} icon={Download} detail="Attendance rows in range" />
          <StatCard label="Present" value={counts.PRESENT} icon={Download} detail={formatPercent(attendanceRate(counts.PRESENT, items.length))} />
          <StatCard label="Absent" value={counts.ABSENT} icon={Download} detail={formatPercent(attendanceRate(counts.ABSENT, items.length))} />
          <StatCard label="Late" value={counts.LATE} icon={Download} detail={formatPercent(attendanceRate(counts.LATE, items.length))} />
          <StatCard label="Excused" value={counts.EXCUSED} icon={Download} detail={formatPercent(attendanceRate(counts.EXCUSED, items.length))} />
        </div>

        <section className="rounded-md border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slatewash text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">{item.record.date.toLocaleDateString()}</td>
                    <td className="px-4 py-3">{item.student.user.name}</td>
                    <td className="px-4 py-3">{item.record.class.name}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{item.remarks ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
