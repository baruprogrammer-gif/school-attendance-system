import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { createTeacher } from "./actions";

export default async function TeachersPage() {
  await requireRole(["ADMIN"]);

  const teachers = await prisma.teacher.findMany({
    include: {
      user: true,
      _count: { select: { classes: true, attendanceRecords: true } }
    },
    orderBy: { user: { name: "asc" } }
  });

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Teacher management"
        description="Create teacher login accounts and keep staff details connected to classes and attendance records."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <form action={createTeacher} className="h-fit rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold">Add teacher</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Full name</label>
              <input className="input mt-1" name="name" required placeholder="Ms. Maya Santoso" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input mt-1" name="email" type="email" required placeholder="teacher@school.test" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Employee ID</label>
                <input className="input mt-1" name="employeeId" required placeholder="T-1001" />
              </div>
              <div>
                <label className="label">Subject</label>
                <input className="input mt-1" name="subject" required placeholder="Math" />
              </div>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input mt-1" name="phone" placeholder="+62..." />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input mt-1" name="password" type="password" required defaultValue="password123" />
            </div>
            <button className="btn-primary w-full" type="submit">
              <Plus className="h-4 w-4" />
              Create teacher
            </button>
          </div>
        </form>

        <section className="rounded-md border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slatewash text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Classes</th>
                  <th className="px-4 py-3">Attendance records</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">
                      <p className="font-medium">{teacher.user.name}</p>
                      <p className="text-xs text-stone-500">{teacher.user.email}</p>
                    </td>
                    <td className="px-4 py-3">{teacher.employeeId}</td>
                    <td className="px-4 py-3">{teacher.subject}</td>
                    <td className="px-4 py-3">{teacher.phone ?? "-"}</td>
                    <td className="px-4 py-3">{teacher._count.classes}</td>
                    <td className="px-4 py-3">{teacher._count.attendanceRecords}</td>
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
