import ExcelJS from "exceljs";
import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { auth } from "@root/auth";
import { prisma } from "@/lib/prisma";
import { getAttendanceReportData } from "@/lib/report-data";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!["ADMIN", "TEACHER"].includes(session.user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const classId = searchParams.get("classId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!classId || !from || !to) {
    return Response.json({ error: "classId, from, and to are required." }, { status: 400 });
  }

  if (session.user.role === Role.TEACHER) {
    const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
    const allowedClass = teacher
      ? await prisma.schoolClass.count({ where: { id: classId, homeroomTeacherId: teacher.id } })
      : 0;

    if (!allowedClass) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const rows = await getAttendanceReportData(classId, from, to);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance");

  worksheet.columns = [
    { header: "Date", key: "date", width: 16 },
    { header: "Class", key: "className", width: 20 },
    { header: "Student ID", key: "studentId", width: 16 },
    { header: "Student", key: "studentName", width: 28 },
    { header: "Teacher", key: "teacherName", width: 28 },
    { header: "Status", key: "status", width: 14 },
    { header: "Remarks", key: "remarks", width: 32 }
  ];

  rows.forEach((item) => {
    worksheet.addRow({
      date: item.record.date.toISOString().slice(0, 10),
      className: item.record.class.name,
      studentId: item.student.studentId,
      studentName: item.student.user.name,
      teacherName: item.record.teacher.user.name,
      status: item.status,
      remarks: item.remarks ?? ""
    });
  });

  worksheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="attendance-${from}-to-${to}.xlsx"`
    }
  });
}
