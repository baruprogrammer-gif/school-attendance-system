import { prisma } from "@/lib/prisma";

export async function getAttendanceReportData(classId: string, from: string, to: string) {
  return prisma.attendanceItem.findMany({
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
      record: {
        include: {
          class: true,
          teacher: { include: { user: true } }
        }
      }
    },
    orderBy: [{ record: { date: "asc" } }, { student: { user: { name: "asc" } } }]
  });
}
