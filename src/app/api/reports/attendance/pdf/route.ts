import { jsPDF } from "jspdf";
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
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  doc.setFontSize(16);
  doc.text("Attendance Report", 40, 44);
  doc.setFontSize(10);
  doc.text(`Period: ${from} to ${to}`, 40, 62);

  let y = 92;
  doc.setFontSize(9);
  doc.text("Date", 40, y);
  doc.text("Student", 108, y);
  doc.text("Class", 260, y);
  doc.text("Status", 360, y);
  doc.text("Remarks", 430, y);
  y += 16;

  rows.forEach((item) => {
    if (y > 760) {
      doc.addPage();
      y = 44;
    }

    doc.text(item.record.date.toISOString().slice(0, 10), 40, y);
    doc.text(String(item.student.user.name ?? "-").slice(0, 26), 108, y);
    doc.text(item.record.class.name.slice(0, 16), 260, y);
    doc.text(item.status, 360, y);
    doc.text(String(item.remarks ?? "-").slice(0, 22), 430, y);
    y += 16;
  });

  const buffer = Buffer.from(doc.output("arraybuffer"));

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="attendance-${from}-to-${to}.pdf"`
    }
  });
}
