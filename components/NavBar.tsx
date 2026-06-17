import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";

export default async function NavBar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-white/80 px-5 py-3 backdrop-blur dark:border-white/10 dark:bg-neutral-950/80">
      <Link href="/" className="text-lg font-extrabold tracking-tight">
        LLM<span className="text-rose-500">Tinder</span>
      </Link>

      {session?.user ? (
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/swipe" className="hover:text-rose-500">
            Swipe
          </Link>
          <Link href="/matches" className="hover:text-rose-500">
            Matches
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-black/10 px-3 py-1.5 hover:bg-neutral-100 dark:border-white/15 dark:hover:bg-neutral-800"
            >
              Sign out
            </button>
          </form>
        </nav>
      ) : (
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="hover:text-rose-500">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-rose-500 px-3 py-1.5 text-white hover:bg-rose-600"
          >
            Sign up
          </Link>
        </nav>
      )}
    </header>
  );
}
