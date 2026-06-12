import { AttendanceStatus } from "@prisma/client";
import { BarChart3, CalendarCheck, GraduationCap, School, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { attendanceRate } from "@/lib/attendance";
import { fromDateInputValue, toDateInputValue } from "@/lib/dates";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const today = fromDateInputValue(toDateInputValue(new Date()));

  const [students, teachers, classes, todayRecords, recentRecords] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.schoolClass.count(),
    prisma.attendanceRecord.findMany({
      where: { date: today },
      include: { items: true }
    }),
    prisma.attendanceRecord.findMany({
      orderBy: { date: "desc" },
      take: 6,
      include: {
        class: true,
        teacher: { include: { user: true } },
        items: true
      }
    })
  ]);

  const totalToday = todayRecords.reduce((sum, record) => sum + record.items.length, 0);
  const presentToday = todayRecords.reduce(
    (sum, record) => sum + record.items.filter((item) => item.status === AttendanceStatus.PRESENT).length,
    0
  );

  return (
    <>
      <PageHeader
        eyebrow={session.user.role.toLowerCase()}
        title={`Welcome, ${session.user.name ?? "User"}`}
        description="Track daily attendance, review class history, and prepare attendance exports from one workspace."
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Students" value={students} icon={GraduationCap} detail="Active student profiles" />
          <StatCard label="Teachers" value={teachers} icon={Users} detail="Teaching staff accounts" />
          <StatCard label="Classes" value={classes} icon={School} detail="Configured school classes" />
          <StatCard label="Today marked" value={totalToday} icon={CalendarCheck} detail="Student attendance entries" />
          <StatCard
            label="Present rate"
            value={formatPercent(attendanceRate(presentToday, totalToday))}
            icon={BarChart3}
            detail="For today's marked entries"
          />
        </div>

        <section className="rounded-md border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 px-4 py-3">
            <h2 className="font-semibold text-ink">Recent attendance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slatewash text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Present</th>
                  <th className="px-4 py-3">Absent</th>
                  <th className="px-4 py-3">Late</th>
                  <th className="px-4 py-3">Excused</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record) => (
                  <tr key={record.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">{record.date.toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">{record.class.name}</td>
                    <td className="px-4 py-3">{record.teacher.user.name}</td>
                    {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map((status) => (
                      <td key={status} className="px-4 py-3">
                        <StatusBadge status={status} />{" "}
                        <span className="ml-1 text-stone-600">
                          {record.items.filter((item) => item.status === status).length}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                {recentRecords.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-stone-500" colSpan={7}>
                      No attendance records yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
