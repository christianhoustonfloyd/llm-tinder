import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMatches } from "@/lib/swipes";
import MatchList from "@/components/MatchList";

export default async function MatchesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matches = await getMatches(session.user.id);

  return (
    <main className="flex-1 p-6">
      <h1 className="mb-6 text-center text-2xl font-bold">
        Your matches{" "}
        <span className="text-rose-500">({matches.length})</span>
      </h1>
      <MatchList matches={matches} />
    </main>
  );
}
