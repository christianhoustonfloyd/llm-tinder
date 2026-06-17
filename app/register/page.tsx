"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type RegisterState } from "./actions";

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:border-white/15 dark:bg-neutral-800"
      />
    </label>
  );
}

export default function RegisterPage() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerAction,
    null
  );

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Find the model you&apos;re compatible with.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <Field label="Name (optional)" name="name" type="text" />
          <Field label="Email" name="email" type="email" required />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            minLength={6}
          />

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-rose-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
