import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { createClass } from "./actions";

export default async function ClassesPage() {
  await requireRole(["ADMIN"]);

  const [classes, teachers] = await Promise.all([
    prisma.schoolClass.findMany({
      include: {
        homeroomTeacher: { include: { user: true } },
        _count: { select: { students: true } }
      },
      orderBy: [{ academicYear: "desc" }, { name: "asc" }]
    }),
    prisma.teacher.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } })
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Class management"
        description="Create class groups, assign homeroom teachers, and track how many students belong to each class."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <form action={createClass} className="h-fit rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold">Add class</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Class name</label>
              <input className="input mt-1" name="name" required placeholder="Class 10A" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Grade</label>
                <input className="input mt-1" name="grade" required placeholder="10" />
              </div>
              <div>
                <label className="label">Room</label>
                <input className="input mt-1" name="room" placeholder="A-201" />
              </div>
            </div>
            <div>
              <label className="label">Academic year</label>
              <input className="input mt-1" name="academicYear" required placeholder="2025/2026" />
            </div>
            <div>
              <label className="label">Homeroom teacher</label>
              <select className="input mt-1" name="homeroomTeacherId" defaultValue="">
                <option value="">Unassigned</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-primary w-full" type="submit">
              <Plus className="h-4 w-4" />
              Create class
            </button>
          </div>
        </form>

        <section className="rounded-md border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slatewash text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Homeroom</th>
                  <th className="px-4 py-3">Students</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((schoolClass) => (
                  <tr key={schoolClass.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 font-medium">{schoolClass.name}</td>
                    <td className="px-4 py-3">{schoolClass.grade}</td>
                    <td className="px-4 py-3">{schoolClass.room ?? "-"}</td>
                    <td className="px-4 py-3">{schoolClass.academicYear}</td>
                    <td className="px-4 py-3">{schoolClass.homeroomTeacher?.user.name ?? "Unassigned"}</td>
                    <td className="px-4 py-3">{schoolClass._count.students}</td>
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
