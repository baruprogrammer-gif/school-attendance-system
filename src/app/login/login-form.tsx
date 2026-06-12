"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-md border border-stone-200 bg-white p-5 shadow-soft">
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input className="input mt-1" id="email" name="email" type="email" required placeholder="admin@school.test" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input className="input mt-1" id="password" name="password" type="password" required placeholder="password123" />
      </div>
      {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <button className="btn-primary w-full" disabled={isLoading} type="submit">
        <LogIn className="h-4 w-4" />
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
      <div className="rounded-md bg-slatewash p-3 text-sm text-stone-600">
        Demo accounts use <span className="font-semibold">password123</span>: admin@school.test,
        teacher@school.test, student@school.test.
      </div>
    </form>
  );
}
