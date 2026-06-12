import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { createStudent } from "./actions";

export default async function StudentsPage() {
  await requireRole(["ADMIN"]);

  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      include: { user: true, class: true },
      orderBy: { user: { name: "asc" } }
    }),
    prisma.schoolClass.findMany({ orderBy: [{ academicYear: "desc" }, { name: "asc" }] })
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Student management"
        description="Register student accounts, assign classes, and store guardian contact details."
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[380px_1fr] lg:px-8">
        <form action={createStudent} className="h-fit rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-semibold">Add student</h2>
          <div className="space-y-3">
            <div>
              <label className="label">Full name</label>
              <input className="input mt-1" name="name" required placeholder="Adi Pratama" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input mt-1" name="email" type="email" required placeholder="student@school.test" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Student ID</label>
                <input className="input mt-1" name="studentId" required placeholder="S-1001" />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input mt-1" name="gender" required defaultValue="Male">
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Birth date</label>
                <input className="input mt-1" name="birthDate" type="date" />
              </div>
              <div>
                <label className="label">Class</label>
                <select className="input mt-1" name="classId" required defaultValue="">
                  <option value="" disabled>
                    Select
                  </option>
                  {classes.map((schoolClass) => (
                    <option key={schoolClass.id} value={schoolClass.id}>
                      {schoolClass.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Guardian</label>
              <input className="input mt-1" name="guardianName" placeholder="Parent or guardian name" />
            </div>
            <div>
              <label className="label">Guardian phone</label>
              <input className="input mt-1" name="guardianPhone" placeholder="+62..." />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="input mt-1 min-h-20" name="address" placeholder="Home address" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input mt-1" name="password" type="password" required defaultValue="password123" />
            </div>
            <button className="btn-primary w-full" type="submit" disabled={classes.length === 0}>
              <Plus className="h-4 w-4" />
              Create student
            </button>
          </div>
        </form>

        <section className="rounded-md border border-stone-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slatewash text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Guardian</th>
                  <th className="px-4 py-3">Phone</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">
                      <p className="font-medium">{student.user.name}</p>
                      <p className="text-xs text-stone-500">{student.user.email}</p>
                    </td>
                    <td className="px-4 py-3">{student.studentId}</td>
                    <td className="px-4 py-3">{student.class.name}</td>
                    <td className="px-4 py-3">{student.gender}</td>
                    <td className="px-4 py-3">{student.guardianName ?? "-"}</td>
                    <td className="px-4 py-3">{student.guardianPhone ?? "-"}</td>
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
