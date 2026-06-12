import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, BookOpen, CalendarCheck, GraduationCap, History, LayoutDashboard, LogOut, School, Users } from "lucide-react";
import { auth, signOut } from "@root/auth";
import { canManageAttendance, canManageSchool, roleLabels } from "@/lib/roles";
import { initials } from "@/lib/utils";

const baseNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { href: "/attendance", label: "Daily attendance", icon: CalendarCheck, roles: ["ADMIN", "TEACHER"] },
  { href: "/history", label: "History", icon: History, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "TEACHER"] },
  { href: "/students", label: "Students", icon: GraduationCap, roles: ["ADMIN"] },
  { href: "/teachers", label: "Teachers", icon: Users, roles: ["ADMIN"] },
  { href: "/classes", label: "Classes", icon: School, roles: ["ADMIN"] }
] as const;

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const nav = baseNav.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="section lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-fern text-white">
              <BookOpen className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-ink">Attendance</span>
              <span className="block text-xs text-stone-500">School system</span>
            </span>
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-saffron/20 text-sm font-bold text-ink lg:hidden">
            {initials(session.user.name)}
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:px-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-slatewash hover:text-ink"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden px-5 pb-5 lg:absolute lg:bottom-0 lg:block lg:w-full">
          <div className="rounded-md border border-stone-200 bg-white p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-saffron/20 text-sm font-bold">
                {initials(session.user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{session.user.name}</p>
                <p className="text-xs text-stone-500">{roleLabels[role]}</p>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="btn-muted mt-3 w-full" type="submit">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}

export { canManageAttendance, canManageSchool };
