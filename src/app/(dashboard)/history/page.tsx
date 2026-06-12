import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

export default async function HistoryPage() {
  const session = await requireSession();

  if (session.user.role === Role.STUDENT) {
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        attendanceItems: {
          include: {
            record: {
              include: {
                class: true,
                teacher: { include: { user: true } }
              }
            }
          },
          orderBy: { record: { date: "desc" } },
          take: 80
        }
      }
    });

    return (
      <>
        <PageHeader
          eyebrow="Student"
          title="My attendance history"
          description="Review your recorded attendance status by date and class."
        />
        <HistoryTable
          rows={(student?.attendanceItems ?? []).map((item) => ({
            id: item.id,
            date: item.record.date,
            className: item.record.class.name,
            teacherName: item.record.teacher.user.name ?? "-",
            studentName: session.user.name ?? "-",
            studentId: student?.studentId ?? "-",
            status: item.status,
            remarks: item.remarks
          }))}
        />
      </>
    );
  }

  const teacher = session.user.role === Role.TEACHER ? await prisma.teacher.findUnique({ where: { userId: session.user.id } }) : null;
  const records = await prisma.attendanceItem.findMany({
    where: teacher
      ? {
          record: {
            class: {
              homeroomTeacherId: teacher.id
            }
          }
        }
      : undefined,
    include: {
      student: { include: { user: true } },
      record: {
        include: {
          class: true,
          teacher: { include: { user: true } }
        }
      }
    },
    orderBy: { record: { date: "desc" } },
    take: 200
  });

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Attendance history"
        description="Browse the latest attendance entries across students, classes, dates, and teachers."
      />
      <HistoryTable
        rows={records.map((item) => ({
          id: item.id,
          date: item.record.date,
          className: item.record.class.name,
          teacherName: item.record.teacher.user.name ?? "-",
          studentName: item.student.user.name ?? "-",
          studentId: item.student.studentId,
          status: item.status,
          remarks: item.remarks
        }))}
      />
    </>
  );
}

function HistoryTable({
  rows
}: {
  rows: {
    id: string;
    date: Date;
    className: string;
    teacherName: string;
    studentName: string;
    studentId: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    remarks?: string | null;
  }[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-md border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slatewash text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-stone-100">
                  <td className="px-4 py-3">{row.date.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.studentName}</p>
                    <p className="text-xs text-stone-500">{row.studentId}</p>
                  </td>
                  <td className="px-4 py-3">{row.className}</td>
                  <td className="px-4 py-3">{row.teacherName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3">{row.remarks ?? "-"}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-stone-500" colSpan={6}>
                    No attendance history yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
