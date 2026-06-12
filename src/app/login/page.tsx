import { auth } from "@root/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/dashboard");

  const params = await searchParams;

  return (
    <main className="grid min-h-screen bg-slatewash lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex items-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="label mb-3">School Attendance</p>
            <h1 className="text-4xl font-bold text-ink sm:text-5xl">Sign in to your school workspace</h1>
            <p className="mt-4 text-base leading-7 text-stone-600">
              Manage classes, daily attendance, reports, and student history from one role-aware dashboard.
            </p>
          </div>
          <LoginForm callbackUrl={params.callbackUrl ?? "/dashboard"} />
        </div>
      </section>
      <section className="hidden bg-ink text-white lg:block">
        <div className="flex h-full flex-col justify-between p-12">
          <div>
            <div className="h-12 w-12 rounded-md bg-coral" />
            <h2 className="mt-10 max-w-lg text-4xl font-semibold leading-tight">
              Real-time attendance operations for busy school days.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {["Admin", "Teacher", "Student"].map((role) => (
              <div key={role} className="rounded-md border border-white/15 bg-white/10 p-4">
                <p className="text-sm text-white/70">Portal</p>
                <p className="mt-1 text-xl font-semibold">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
